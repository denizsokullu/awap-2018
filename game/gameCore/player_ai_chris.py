import copy

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


    def place_unit(self, node, amount):
        if amount <= self.max_units:
            place = (node, amount)
            self.dict_moves['place'].append(place)
            self.max_units -= amount

    def move_unit(self, start, end, amount):
        if (start != end) and (start[1]['old_units'] >= amount):
            move = (start[0], end[0], amount)
            self.dict_moves['move'].append(move)
            self.board.nodes(data=True)[start[0]]['old_units'] -= amount

    def init_turn(self, board, nodes, max_units):
        self.board = board
        self.nodes = nodes
        self.max_units = max_units
        self.moved_nodes = None

        self.dict_moves = {'place': [], 'move': []}


    def player_place_units(self):
        # If player is "losing" to someone next to them, funnel units towards that square
        places_needing_units = []
        left_to_place = self.max_units
        for node in self.nodes:
            old_units = self.board.nodes[node]['old_units']
            num_needed_here = 0
            for neighbor in self.board[node]:
                neighbor = self.board.nodes[neighbor]
                if(neighbor['owner'] != self.player_num):
                    num_needed_here += neighbor['old_units']
            places_needing_units.append((node, num_needed_here))
        places_needing_units = sorted(places_needing_units, key = lambda x: x[1])

        for (node,amount) in places_needing_units:
            amount_to_place_here = min(left_to_place,amount+1)
            self.place_unit(node, amount_to_place_here)
            left_to_place -= amount_to_place_here
            if(left_to_place <= 0):
                break

        nodes_added_to = [a[0] for a in places_needing_units]

        # add one to nodes with one unit
        if(left_to_place > 0):
            for node in self.nodes:
                if(self.nodes[node]['old_units'] == 1 and node not in nodes_added_to):
                    self.place_unit(node,1)
                    left_to_place -= 1
                if(left_to_place <= 0):
                    break

        # add more in reverse order, distribute evenly
        if(left_to_place > 0):
            if(len(nodes_added_to) > 0):
                nodes_to_add_to = nodes_added_to
            else:
                nodes_to_add_to = self.nodes
            num_in_each = left_to_place//len(nodes_to_add_to)
            leftover = left_to_place%len(nodes_to_add_to)
            for node in reversed(nodes_to_add_to):
                amount = num_in_each
                if(leftover > 0):
                    leftover -= 1
                    amount += 1
                if(amount > 0):
                    self.place_unit(node,amount)


        return self.dict_moves

    def player_move_units(self):
        #if you see a neighbor you can attack, do it.

        empty_neighbors = []
        attackable_neighbors = {}

        node_to_attackable_neighbor = {}

        node_units_available = {}


        for node in self.nodes:
            old_units = self.board.nodes[node]['old_units']
            node_units_available[node] = old_units
            for neighbor in self.board[node]:
                if(self.board.nodes[neighbor]['owner'] != self.player_num):
                    neighbor_amount = self.board.nodes[neighbor]['old_units']
                    if(neighbor_amount + 1 < old_units):
                        try:
                            attackable_neighbors[(neighbor, neighbor_amount)].append(node)
                        except KeyError:
                            attackable_neighbors[(neighbor, neighbor_amount)] = [node]
                        try:
                            node_to_attackable_neighbor[node].append((neighbor,neighbor_amount))
                        except KeyError:
                            node_to_attackable_neighbor[node] = [(neighbor,neighbor_amount)]


        neighbors_moved = set()

        for node in node_to_attackable_neighbor:
            for(neighbor,neighbor_amount) in node_to_attackable_neighbor[node]:
                if(neighbor not in neighbors_moved):
                    # only one node can attack this, go ahead
                    if(node_units_available[node] > neighbor_amount + 1):
                        node_units_available[node] -= neighbor_amount + 1
                        self.move_unit((node,self.board.nodes[node]), (neighbor,self.board.nodes[neighbor]), neighbor_amount + 1)
                        neighbors_moved.add(node)

        for neighbor,node in empty_neighbors:
            if(node_units_available[node] > 1):
                # move 1 unit to all empty squares
                node_units_available[node] -= 1
                self.move_unit((node,self.board.nodes[node]), (neighbor,self.board.nodes[neighbor]), 1);

        return self.dict_moves
