import networkx as nx
import copy

class Board():
    def __init__(self):
        self.G = self.generate_graph()
        self.players = {1: {'player': 'p1', 'gain': 1}, 2: {'player': 'p2', 'gain': 1}}

    def generate_graph(self):
        init = {0: {'owner': 1, 'old_units': 20, 'new_units': 0}, 1: {'owner': 2, 'old_units': 10, 'new_units': 0}, 2: {'owner': None, 'old_units': 0, 'new_units': 0}}
        edges = [(0, 1), (1, 2)]
        G = nx.Graph(edges)
        nx.set_node_attributes(G, init)
        return G

    def get_owned_nodes(self, owner):
        nodes = {}
        for val in filter(lambda node: node[1]['owner'] == owner, self.G.nodes(data=True)):
            nodes[val[0]] = val[1]
        return nodes, self.players[owner]

    def draw(self):
        # nx.draw(self.G)
        G=nx.dodecahedral_graph()
        nx.draw(G)


    def check_moves(self, dict_moves, p_id):
        copy_graph = self.G.copy()
        copy_players = copy.deepcopy(self.players)
        total_possible = self.players[p_id].get('gain')
        place = dict_moves.get('place')
        nodes_accessed = set()
        if place:
            for node, units in place:
                if units > total_possible:
                    print('Error: Number of units is greater than the total possible.')
                    return None, None
                total_possible -= units
                if copy_graph.nodes[node]['owner'] != p_id:
                    print('Error: Player does not own tile they are placing into.')
                    return None, None
                copy_graph.nodes[node]['old_units'] += units
                nodes_accessed.add(node)

        movement = dict_moves.get('move')
        if movement:
            for start, end, units in movement:
                if copy_graph.nodes[start]['owner'] != p_id:
                    print('Error: Player does not own tile they are starting from.')
                    return None, None
                if copy_graph.nodes[start]['old_units'] <= units:
                    print('Error: Player does not have enough units to move from start.')
                    return None, None

                copy_graph.nodes[start]['old_units'] -= units
                if end not in copy_graph.neighbors(start):
                    print('Error: End node is not a neighbor of the start node.')
                    return None, None
                elif copy_graph.nodes[end]['owner'] == p_id:
                    copy_graph.nodes[end]['new_units'] += units
                    nodes_accessed.add(end)
                elif copy_graph.nodes[end]['old_units'] >= units:
                    copy_graph.nodes[end]['old_units'] = max(copy_graph.nodes[end]['old_units'] - units, 1)
                    nodes_accessed.add(end)
                else:
                    copy_graph.nodes[end]['new_units'] = units - copy_graph.nodes[end]['old_units']
                    copy_graph.nodes[end]['old_units'] = 0
                    if copy_graph.nodes[end]['owner']:
                        copy_players[copy_graph.nodes[end]['owner']]['gain'] -= 1
                    copy_graph.nodes[end]['owner'] = p_id
                    copy_players[p_id]['gain'] += 1
                    nodes_accessed.add(end)

        for node in nodes_accessed:
            copy_graph.nodes[node]['old_units'] += copy_graph.nodes[node]['new_units']
            copy_graph.nodes[node]['new_units'] = 0

        self.G = copy_graph.copy()
        return copy_graph, copy_players

