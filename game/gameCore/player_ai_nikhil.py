import copy
import random
import math
import networkx as nx
import operator

class Player():
    def __init__(self, p_id):
        self.dict_moves = {'place': [], 'move': []}
        # each player on a board will have a unique player number
        self.player_num = p_id
        # max number of units the player can place
        self.max_units = 0
        self.nodes = None
        self.board = None
        self.moved_nodes = None

        #TODO: Move to Player_Robot class
        self.long_term_attack_targets = set() 
        self.long_term_protect_targets = set()
        self.long_term_unit_counts = dict() #Contains (prev_enemy_count, curr_enemy_count)
        self.long_term_movements = dict() # Contains list of nodes to move to


    # node is node id (int)
    def place_unit(self, node, amount):
        if (self.list_graph[node] is None):
            print("Error: Node does not exist in list_graph")
            return

        if (self.list_graph[node][1]['owner'] != self.player_num):
            return


        if ((amount <= self.max_units) and (amount > 0)):
            place = (node, amount)
            self.dict_moves['place'].append(place)
            self.max_units -= amount

    # Start / End are node ids (int)
    def move_unit(self, start, end, amount):

        if (amount <= 0):
            return

        start_node = self.list_graph[start]
        end_node = self.list_graph[end]

        if ((start is None) or (end is None)):
            print("Error: Node does not exist in list_graph")
            return

        if (start_node[1]['owner'] != self.player_num):
            return

        if (start != end) and (start_node[1]['old_units'] > amount):
            # print('Moving ' + str(amount) + ' units from ' + str(start_node) + ' to ' + str(end_node))
            move = (start, end, amount)
            self.dict_moves['move'].append(move)
            self.board.nodes(data=True)[start]['old_units'] -= amount

    def init_turn(self, board, nodes, max_units):
        self.board = board
        self.list_graph = list(self.board.nodes(data=True))
        self.nodes = nodes
        self.max_units = max_units
        self.moved_nodes = None

        self.dict_moves = {'place': [], 'move': []}

    def player_place_units(self):
        self.nikhil_player_place_units()
        return self.dict_moves

    def player_move_units(self):
        self.nikhil_player_move_units()
        return self.dict_moves

    def get_enemy_units(self, node, min_val=False):
        neighbors = self.board.neighbors(node)
        curr_enemy_count = 0
        min_count = 9999999 # TODO: Whatever INF is in python
        for n in neighbors:
            n_node = self.board.nodes[n]
            if (n_node['owner'] != self.player_num):
                min_count = min(min_count, n_node['old_units'])
                curr_enemy_count += n_node['old_units']
        if (min_val):
            if (min_count == 9999999):
                return 0
            return min_count
        return curr_enemy_count

    def nikhil_player_place_units(self):
        for target in self.long_term_unit_counts:
            curr_enemy_count = self.get_enemy_units(target)
            prev_enemy_count = self.long_term_unit_counts[target][0]
            self.long_term_unit_counts[target] = (prev_enemy_count, curr_enemy_count)

        for target in copy.copy(self.long_term_protect_targets):
            if (target in self.long_term_unit_counts):
                count = self.long_term_unit_counts[target]
                self.place_unit(target, count[1] - count[0])
                self.long_term_unit_counts[target] = (self.long_term_unit_counts[target][1], self.get_enemy_units(target))
            else:
                self.long_term_unit_counts[target] = (0, self.get_enemy_units(target))
            if (self.long_term_unit_counts[target][1] == 0):
                self.long_term_unit_counts.pop(target, None)
                self.long_term_protect_targets.remove(target)

        for target in copy.copy(self.long_term_attack_targets):
            if (target in self.long_term_unit_counts):
                self.long_term_unit_counts[target] = (self.long_term_unit_counts[target][1], self.get_enemy_units(target, True))
            else:
                self.long_term_unit_counts[target] = (0, self.get_enemy_units(target, True))

            count = self.long_term_unit_counts[target]
            new_units = min(count[1] - self.list_graph[target][1]['old_units'] + 2, self.max_units)
            self.place_unit(target, new_units)
            if (self.long_term_unit_counts[target][1] == 0):
                self.long_term_unit_counts.pop(target, None)
                self.long_term_attack_targets.remove(target)

        for i in range(self.max_units, 0, -1):
            node = random.choice(list(self.nodes))
            self.place_unit(node, 1)
        return self.dict_moves

    def nikhil_player_move_units(self):
        # Execute any actions that can be completed in 1 turn
        for nodes in self.nodes:
            neighbors = self.board.neighbors(nodes)
            self_units = self.board.nodes[nodes]['old_units']
            for n in neighbors:
                n_node = self.board.nodes[n]
                n_units = n_node['old_units']
                n_owner = n_node['owner']

                if (n_owner != self.player_num):
                    # Attack Priority
                    if ((n_units + 1) < self_units):
                        self.move_unit(nodes, n, n_units + 1)
                    else:
                        self.long_term_attack_targets.add(nodes)
                    
                    # Protect nodes at risk                
                    if ((n_owner != None) and (n_owner != self.player_num)):                    
                        if (n_units > self_units/2):
                            self.long_term_protect_targets.add(nodes)


        # Schedule multi-turn attack moves
        # TODO: make sure paths only go through owned nodes
        for nodes in self.long_term_attack_targets:
            # Calculate how many units we will need
            neighbors = self.board.neighbors(nodes)
            targets = []
            for n in neighbors:
                n_node = self.board.nodes[n]
                if (n_node['owner'] != self.player_num):
                    targets.append((n, n_node['old_units']))
            targets.sort(key=lambda pair: pair[1])

            #Calculate all path lengths, even if we don't use it
            length = nx.all_pairs_shortest_path_length(self.board)
            list_len = list(length)
            curr_dists = list_len[nodes][1] #Dictionary(id:dist)
            curr_dists = sorted(curr_dists.items(), key=operator.itemgetter(1))

            curr_dists = filter(lambda d: (d[1] < 5) and (d[1] > 0), curr_dists)
            curr_target = 0
            if (targets):
                units_needed = targets[0][1]
                for d in curr_dists:
                    src = d[0]
                    path = nx.shortest_path(self.board, src, nodes)
                    path.pop(0)
                    if (src not in self.long_term_movements):
                        tmp_node = self.board.nodes[src]
                        # Potential optimization: spread requested units out
                        mov = list()
                        mov.append((copy.copy(path), min(tmp_node['old_units']-1, units_needed)))
                        mov.append((copy.copy(path), 0))
                        self.long_term_movements[src] = mov
                        units_needed -= self.long_term_movements[src][0][1]
                    if (units_needed <= 0):
                        break;


        # Execute long term actions
        for mov_src in copy.copy(self.long_term_movements):
            actions = self.long_term_movements[mov_src]
            for act in actions:                
                dst = act[0].pop(0)

                self.long_term_movements[mov_src].remove(act)
                if (act[0]):
                    if (dst in self.long_term_movements):
                        self.long_term_movements[dst].append(copy.copy(act))
                    else:
                        self.long_term_movements[dst] = list()
                        self.long_term_movements[dst].append(copy.copy(act))
                self.move_unit(mov_src, dst, act[1])

        #TODO: Prune targets


        # boundary = self.G.node_boundary(self.nodes)
        
        # for nodes in boundary:
        #     neighbors = self.G.neighbors(nodes)
        #     for n in neighbors
        # Move units from inside nodes to border nodes
        return self.dict_moves
