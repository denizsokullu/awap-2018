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
        for node in self.nodes:
            if self.player_num == self.nodes[node]['owner']:
                self.place_unit(node, self.max_units);
        return self.dict_moves

    def player_move_units(self):
        nodes = list(self.board.nodes(data=True))
        for self_nodes in self.nodes:
            node1 = nodes[self_nodes] #TODO: Why do I need to do this? Why can't I get the Tuple directly?
            for node2 in nodes:
                if (self.board.has_edge(node1[0],node2[0])):
                    if (node1[0] < node2[0]):
                        self.move_unit(node1, node2, 2)

        return self.dict_moves
