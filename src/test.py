import collections


class BinarySearchTree:
    Node = collections.namedtuple('Node', ['left', 'right', 'value'])

    @staticmethod
    def contains(root, value):
        node_value = root.value
        nodeRight = root.right
        nodeLeft = root.left
        print(node_value)
        if value >= node_value and nodeRight is not None:
            return BinarySearchTree.contains(nodeRight, value)
        elif value <= node_value and nodeLeft is not None:
            return BinarySearchTree.contains(nodeLeft, value)
        elif value == node_value:
            return True
        else:
            return False


n1 = BinarySearchTree.Node(value=1, left=None, right=None)
n3 = BinarySearchTree.Node(value=3, left=None, right=None)
n2 = BinarySearchTree.Node(value=2, left=n1, right=n3)
print(n2.value)
print(BinarySearchTree.contains(n2, 3))