import networkx as nx
import matplotlib.pyplot as plt
import random

"""
File for 'Grid 0'
"""

'''
Returns a NetworkX graph of 'Grid 0', an N by N square grid with some edges deleted.
Note that each node in the grid is defined by a pair (x,y).
The recommended value of N is 20.

N: length of the grid, i.e. grid dimensions are N by N

REQUIRES: N is an EVEN positive integer
'''
def generateGrid0(N):
    halfN = N//2
    G=nx.grid_2d_graph(N,N)
    pos = dict( (n, n) for n in G.nodes() )
    labels = dict( ((i, j), i + (N-1-j) * 10 ) for i, j in G.nodes() )

    origin = (halfN,halfN)

    for i in range(halfN):
        for j in range(halfN):
            if (i%4==0 and j%4==0):
                node1 = tuple(map(sum, zip(origin, (i,j))))
                node2 = tuple(map(sum, zip(origin, (i,j+1))))
                node3 = tuple(map(sum, zip(origin, (i+1,j))))

                # print node2

                G.remove_edge(node1,node2)
                G.remove_edge(node1,node3)

                node1 = tuple(map(sum, zip(origin, (i,0-j-1))))
                node2 = tuple(map(sum, zip(origin, (i,0-j-2))))
                node3 = tuple(map(sum, zip(origin, (i+1,0-j-1))))

                G.remove_edge(node1,node2)
                G.remove_edge(node1,node3)

                node1 = tuple(map(sum, zip(origin, (0-i-1,0-j-1))))
                node2 = tuple(map(sum, zip(origin, (0-i-1,0-j-2))))
                node3 = tuple(map(sum, zip(origin, (0-i-2,0-j-1))))

                G.remove_edge(node1,node2)
                G.remove_edge(node1,node3)

                node1 = tuple(map(sum, zip(origin, (0-i-1,j))))
                node2 = tuple(map(sum, zip(origin, (0-i-1,j+1))))
                node3 = tuple(map(sum, zip(origin, (0-i-2,j))))

                G.remove_edge(node1,node2)
                G.remove_edge(node1,node3)

    G = nx.relabel_nodes(G,lambda x:x[0] * N + x[1])

    board = {}

    for node in G.nodes:
        board[node] = {'owner':None, 'old_units': 10, 'new_units': 0}

    board[0] = {'owner':1, 'old_units': 10, 'new_units': 0}
    board[20] = {'owner':2, 'old_units': 10, 'new_units': 0}
    nx.set_node_attributes(G,board)

    return G

'''
Prints a 'Grid 0' with length N.
The recommended value of N is 20.

REQUIRES: N is an EVEN positive integer
'''
def printGrid0(N):
    G = generateGrid0(N)
    print (nx.is_connected(G))
    pos = nx.spring_layout(G)

    nodelabels = {}
    for i in range(N*N):
        nodelabels[i] = str(i)

    nx.draw(G,pos = pos,labels = nodelabels)
    plt.show()