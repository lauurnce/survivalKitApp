# Discrete Structures and Algorithms Study Guide
<!-- subject: Discrete Structures and Algorithms | year: 2nd -->

> Draft status: rewritten study-app material based on the uploaded course module PDF. School identifiers, author/instructor information, course logistics, and institution-specific wording have been removed or generalized.

---

<!-- kind: content -->
## Module 1: Introduction to Data Structures

Computers work with large amounts of information. To process that information efficiently, data must be arranged in a way that makes storage, retrieval, updating, and computation practical. A **data structure** is a method of organizing data in memory or storage so that a program can use the data effectively.

A good data structure answers two important questions:

1. **How will the data be stored?**
2. **What operations will be performed on the data?**

For example, a program that frequently searches for records may need a different structure from a program that mostly adds new records at the end of a list.

### Data, Structure, and Data Structure

**Data** means raw facts or values that can be processed, such as numbers, names, grades, or symbols.

**Structure** refers to the arrangement or organization of parts.

A **data structure** is therefore an organized collection of data that supports specific operations. Common examples include arrays, linked lists, stacks, queues, trees, graphs, and hash tables.

### Linear and Nonlinear Data Structures

Data structures can be grouped based on how their elements are connected.

| Category | Description | Examples |
|---|---|---|
| Linear | Elements are arranged in a sequence. Each item has a clear previous and next relationship, except at the ends. | Array, linked list, stack, queue |
| Nonlinear / hierarchical | Elements are not arranged in one straight sequence. Items may branch or connect in multiple directions. | Tree, graph, heap |

### Data Types

A **data type** describes the kind of value a variable can store. Examples include:

- integers for whole numbers
- floating-point or real numbers for decimal values
- characters for single symbols
- Boolean values for `true` or `false`
- strings for sequences of characters

Choosing the correct data type helps a program store values properly and perform valid operations on them.

### Abstract Data Types

An **Abstract Data Type (ADT)** describes data and the operations allowed on that data without focusing on how the data is implemented internally.

For example, a stack ADT may define these operations:

- `push` to add an item
- `pop` to remove the most recently added item
- `peek` to view the top item
- `isEmpty` to check whether the stack has no items

The ADT describes what the structure can do. The implementation decides how it is built, such as by using an array or a linked list.

### Algorithms

An **algorithm** is a finite set of clear instructions used to solve a problem or perform a task. A program is usually based on one or more algorithms.

A valid algorithm should have:

| Criterion | Meaning |
|---|---|
| Input | It may receive zero or more values. |
| Output | It should produce at least one result. |
| Definiteness | Each instruction must be clear and unambiguous. |
| Finiteness | It must stop after a limited number of steps. |
| Effectiveness | Each step must be possible to perform. |

### Pseudocode

**Pseudocode** is a plain-language description of an algorithm. It looks more structured than regular writing but is not tied to a specific programming language. It is useful for planning logic before writing code.

### Stepwise Refinement

**Stepwise refinement** means starting with a broad solution and gradually breaking it into smaller, more detailed steps until the algorithm is ready to be coded.

### Algorithm Analysis

Algorithm analysis studies how many resources an algorithm needs. The most common resources are:

- **time**, often measured by the number of operations
- **memory**, or the amount of storage needed

Common cases include:

- **best case**: the most favorable input condition
- **worst case**: the least favorable input condition
- **average case**: expected behavior over typical inputs

---

<!-- kind: activity -->
## Activity 1: Positive or Negative Number

Write an algorithm, pseudocode, and Java condition that identifies whether a number is positive or negative.

### Algorithm

1. Read a number from the user.
2. Check if the number is greater than zero.
3. Display `Positive` if the condition is true.
4. Otherwise, display `Negative`.

### Pseudocode

```text
INPUT number
IF number > 0 THEN
    DISPLAY "Positive"
ELSE
    DISPLAY "Negative"
END IF
```

### Java Example

```java
if (number > 0) {
    System.out.println("Positive");
} else {
    System.out.println("Negative");
}
```

### Practice Task

Create a program that accepts three grades: prelim, midterm, and final. Compute the average. If the average is at least `75`, display `Passed`; otherwise, display `Failed`. Then write the algorithm and pseudocode for your solution.

---

<!-- kind: content -->
## Module 2: Costs, Benefits, and Choosing Data Structures

No single data structure is best for every situation. Each structure has trade-offs involving:

- memory usage
- speed of insertion
- speed of deletion
- speed of searching
- programming complexity

For example, arrays are simple and fast when directly accessing an element by index, but inserting into the middle of an array may require shifting many elements. Linked lists can grow dynamically, but accessing a specific position is slower because the list must be followed node by node.

### Data Structure, Data Type, and ADT Compared

| Term | Main Idea | Example |
|---|---|---|
| Data type | Defines the kind of value a variable may hold. | `int`, `double`, `char`, `boolean` |
| Data structure | Organizes data so operations can be performed efficiently. | array, linked list, stack |
| ADT | Describes behavior and operations without exposing implementation details. | stack ADT, queue ADT, list ADT |

### Primitive Data Structures

Primitive or basic data structures represent simple individual values. Examples include:

- integer
- real number
- character
- Boolean

These are sometimes called atomic because they store values that are usually treated as single units.

### Simple Types

| Type | Description |
|---|---|
| Integer | Stores whole numbers. |
| Real number | Stores decimal or floating-point values. |
| Character | Stores letters, digits, or symbols as individual characters. |
| Logical / Boolean | Stores truth values such as `true` or `false`. |
| Enumeration | Defines a limited set of named values. |
| Subrange / partial type | Restricts possible values to a smaller range. |

### Pointer Type

A **pointer** stores a memory address. It can refer to another variable, object, record, or function. Pointers are especially important in structures such as linked lists, where one node must refer to another.

### Structured Types

Structured types group multiple values under one name.

| Type | Description |
|---|---|
| Array | Stores multiple elements of the same type under one name. |
| String | Stores a sequence of characters. |
| Record / structure | Stores related fields that may have different types. |

### Abstraction and Encapsulation

**Abstraction** hides unnecessary details and focuses on what something does.

**Encapsulation** groups data with the operations that work on it and protects internal details from direct outside access.

An ADT works like a black box: the user knows the allowed operations and expected results, but does not need to know the internal implementation.

### Logical and Physical Forms

Every data structure can be viewed in two ways:

| Form | Description |
|---|---|
| Logical form | The concept or behavior of the structure, such as a stack where the last item added is removed first. |
| Physical form | The actual memory implementation, such as an array-based stack or linked-list-based stack. |

### Characteristics of Data Structures

| Characteristic | Description | Example |
|---|---|---|
| Linear | Items are arranged in sequence. | array |
| Nonlinear | Items are connected in branching or network-like relationships. | tree, graph |
| Homogeneous | All elements have the same type. | array of integers |
| Non-homogeneous | Elements may have different types. | record / object |
| Static | Size is fixed before or during compilation. | fixed-size array |
| Dynamic | Size can grow or shrink while the program runs. | linked list |

### Common Data Structures

| Structure | Main Use |
|---|---|
| Array | Store same-type elements using indexes. |
| Stack | Process items in Last-In, First-Out order. |
| Queue | Process items in First-In, First-Out order. |
| Linked list | Store items as connected nodes. |
| Tree | Represent hierarchical relationships. |
| Graph | Represent networks of connected objects. |
| Trie | Store and search strings by prefix. |
| Hash table | Store key-value pairs for fast lookup. |

---

<!-- kind: activity -->
## Activity 2: Review Questions

Answer the following in your own words:

1. What is a data structure?
2. How is a data structure different from an ADT?
3. Why is abstraction useful in programming?
4. Give two practical uses of data structures.
5. Is the logical view of a data structure always the same as its physical memory representation? Explain.
6. When studying a structure as an ADT, what details are most important?

---

<!-- kind: content -->
## Module 3: Arrays and Linked Lists

### Array Concepts

An **array** stores a fixed number of elements under one name. In most programming languages, all array elements must have the same data type.

Important terms:

| Term | Meaning |
|---|---|
| Element | A value stored inside an array. |
| Index | A numeric position used to access an element. |

In many languages, array indexes start at `0`. For example, if an array has five fruits:

```text
fruits = ["Apple", "Papaya", "Atis", "Santol", "Mango"]
```

Then:

```text
fruits[0] = "Apple"
fruits[4] = "Mango"
```

### Basic Array Operations

| Operation | Description |
|---|---|
| Traverse | Visit or display each element one by one. |
| Insert | Add a new element at a chosen position. |
| Delete | Remove an element from a chosen position. |
| Search | Find an element by index or value. |
| Update | Change the value stored at an index. |

### One-Dimensional and Two-Dimensional Arrays

A **one-dimensional array** is like a single row of values.

```text
scores[0], scores[1], scores[2], ...
```

A **two-dimensional array** is arranged using rows and columns, like a table.

```text
matrix[row][column]
```

### Arrays: Strengths and Limitations

Arrays are easy to use because each item can be accessed directly by index. This makes reading an element fast.

However, insertion and deletion can be expensive when they happen in the middle of an array. Elements may need to shift left or right to keep the array organized.

For searching:

- an unsorted array may require checking each element one by one
- a sorted array can support faster searching, such as binary search

### Linked List Concepts

A **linked list** stores data as nodes. Each node contains:

1. the data item
2. a link or reference to the next node

Unlike arrays, linked lists do not require all elements to be stored beside each other in memory. This allows them to grow or shrink while the program runs.

### Linked List Strengths and Limitations

| Strength | Limitation |
|---|---|
| Can grow dynamically. | No direct access by index. |
| Insertions and deletions can be efficient when the correct node is known. | Searching may require following links from the beginning. |
| Memory is allocated as needed. | Extra memory is needed for links/references. |

### Common Linked List Variations

| Type | Description |
|---|---|
| Singly linked list | Each node points to the next node. |
| Circular linked list | The last node points back to the first node. |
| Doubly linked list | Each node points to both the previous and next node. |
| Doubly circular linked list | A doubly linked list where the last and first nodes are also connected. |

### Diagram Descriptions

A simple linked list may be shown as circles or boxes connected by arrows. Each circle/box represents a node, and each arrow represents the link to the next node.

A dummy node is an extra node used to simplify operations near the beginning or end of a list. It may act as a placeholder so that insertion and deletion logic becomes more consistent.

---

<!-- kind: activity -->
## Activity 3: Linked List Operations

For each word or phrase below, draw nodes connected by arrows. Then perform the requested operation.

### Rearranging

1. Rearrange `ALGORITHM` into `MHTIROGLA`.
2. Rearrange `DATA_STRUCTURE` into `STRUCTURE_DATA`.

### Insertion

1. Given `COMPUTER_TECHNOLOGY`, insert `INFORMATION` after `COMPUTER`.
2. Given `ALGORITHM`, insert `ANALYSIS` after `ALGO`.

### Deletion

1. From `COMPUTER_TECHNOLOGY`, delete `LOGY`.
2. From `ALGORITHM`, delete `THM`.

### Extra Practice

Create five original examples each for rearranging, insertion, and deletion using linked-list diagrams.

---

<!-- kind: content -->
## Module 4: Array-Based Linked List Storage

A linked list can be represented using arrays. This approach is sometimes called an **array implementation of a linked list** or a **cursor-based linked list**.

Instead of using actual memory pointers, the structure uses indexes.

### Key and Next Arrays

Two parallel arrays are commonly used:

| Array | Purpose |
|---|---|
| `key` | Stores the actual data value. |
| `next` | Stores the index of the next item in the list. |

A special index such as `head` marks the start of the list. Another special marker may represent the end of the list.

For example:

```text
next[head] = 4
key[4] = "A"
next[4] = 3
key[3] = "L"
```

This means the first item after `head` is stored at index `4`, and that item contains `A`. The next item is at index `3`, containing `L`.

### Why Use This Representation?

Array-based linked lists help students understand how links work without using actual pointer syntax. They also show that the logical order of a list does not need to match the physical order of values in storage.

### Example: Reading an Array-Based List

Suppose the list uses these records:

| Index | Key | Next |
|---:|---|---:|
| 0 | HEAD | 4 |
| 4 | A | 3 |
| 3 | L | 2 |
| 2 | I | 6 |
| 6 | S | 1 |
| 1 | TAIL | 1 |

Starting from `HEAD`, follow the `next` values:

```text
HEAD -> A -> L -> I -> S -> TAIL
```

The list order is based on links, not on index order.

---

<!-- kind: activity -->
## Activity 4: Design an Array-Based Linked List

Create storage-allocation tables for three computer-related words:

1. one word with 5 distinct letters
2. one word with 7 distinct letters
3. one word with 9 distinct letters

For each word:

1. Create a `key` array.
2. Create a `next` array.
3. Identify the `head` and ending marker.
4. Show the final linked-list order using arrows.

Example words you may use or replace:

```text
LEARN
NETWORK
CUSTOMIZE
```

### Programming Practice

Write a program that simulates a linked list using two arrays: one for values and one for next indexes. Display the final word by following the links from the head.

```java
public class ArrayLinkedListDemo {
    public static void main(String[] args) {
        String[] key = {"HEAD", "T", "I", "L", "A", "TAIL", "S"};
        int[] next = {4, 5, 6, 2, 3, 5, 1};

        int current = next[0];
        while (!key[current].equals("TAIL")) {
            System.out.print(key[current]);
            current = next[current];
        }
    }
}
```

---

<!-- kind: activity -->
## Activity 5: Sorted and Unsorted Array Lists

Create two programs that store names in an array-backed list.

### Part A: Unsorted List

Initial list:

```text
Mitch, Diane, Jack, Robbie, Katherine
```

Tasks:

1. Display each element and its index.
2. Add `Morrie` to the list.
3. Display the new list and explain where the new item was placed.
4. Remove `Jack`.
5. Display the updated list and explain what happened to the old position of `Jack`.

### Part B: Sorted List

Initial list:

```text
Diane, Jack, Katherine, Mitch, Robbie
```

Tasks:

1. Display each element and its index.
2. Add `Morrie` while keeping the list sorted.
3. Display the new list and explain why `Morrie` belongs in that position.
4. Remove `Jack`.
5. Display the updated list and explain how indexes changed.

### Part C: Large Integers with Linked Lists

Represent a very large number as a linked list where each node stores one digit. Add two such lists digit by digit, carrying `1` when a sum reaches `10` or more.

Example idea:

```text
Number A: 4 -> 3 -> 1 -> 3 -> 5
Number B: 1 -> 7 -> 2
Result:   4 -> 3 -> 3 -> 0 -> 7
```

Write a program that adds two linked-list integers using the same logic for every digit position.

### Part D: Circular Linked List in C

Write a C program that creates a circular linked list and displays its values.

Test data:

```text
Number of nodes: 3
Node 1: 2
Node 2: 5
Node 3: 8
```

Expected display:

```text
Data 1 = 2
Data 2 = 5
Data 3 = 8
```

---

<!-- kind: content -->
## Module 5: Stack Data Structure

A **stack** is a linear data structure where insertion and removal happen at the same end, called the **top**. It follows **Last-In, First-Out (LIFO)** order.

This means the last item placed into the stack is the first item removed.

A common real-world example is a stack of plates. The newest plate placed on top is usually the first one taken off.

### Basic Stack Operations

| Operation | Description |
|---|---|
| `push` | Adds an item to the top of the stack. |
| `pop` | Removes and returns the top item. |
| `peek` / `top` | Returns the top item without removing it. |
| `isEmpty` | Checks whether the stack contains no items. |

### Overflow and Underflow

- **Overflow** happens when an item is pushed into a stack that has no more available space.
- **Underflow** happens when a pop operation is attempted on an empty stack.

In Java, built-in dynamic collections can grow as needed, but the concepts still matter when stacks are implemented with fixed-size arrays.

### Java Stack `lastElement()`

In Java, a `Stack` object can use `lastElement()` to retrieve the item at the last index of the stack's internal list.

Syntax:

```java
stack.lastElement();
```

This returns a value but does not remove it.

---

<!-- kind: activity -->
## Activity 6: Stack Simulation

In the following exercises, each letter represents data. Each asterisk `*` means delete the most recent available item using stack behavior.

Example:

```text
CO*MPU**T*ERS*
```

Read from left to right:

- letters are pushed onto the stack
- `*` pops the top item

Write the final stack contents after processing each string:

1. `DATA***STRUCT***URES_AND_*****ALGORITHMS`
2. `INFORM******ATION_***TECHNOL*****OGY***`
3. `CUS***TOMI***ZING***_WIND****OWS**`
4. `DATA**_STRU***CTU*RES**`
5. `AL*G**ORIT***HMS**`
6. `SO**FT**WA*RE_EN**GINE**ERIN**G**`
7. `C**OM*PU*TER**_PRO**GRA**MMING****`

---

<!-- kind: activity -->
## Activity 7: Java Stack Example

Create and display a stack of names. Then show the last element stored in it.

```java
import java.util.Stack;

public class StackNamesDemo {
    public static void main(String[] args) {
        Stack<String> names = new Stack<>();

        names.push("Ana");
        names.push("Ben");
        names.push("Carlo");
        names.push("Dana");

        System.out.println("Stack: " + names);
        System.out.println("Last element: " + names.lastElement());
        System.out.println("Top element: " + names.peek());
    }
}
```

### Practice Tasks

1. Create a program that accepts 10 student names and displays the last name entered.
2. Create a program that accepts 10 even numbers and displays the first number entered.

---

<!-- kind: content -->
## Module 6: Queue Data Structure

A **queue** is a linear structure that follows **First-In, First-Out (FIFO)** order. The first item added is the first item removed.

A queue uses two ends:

| End | Purpose |
|---|---|
| Rear | New items are inserted here. |
| Front | Items are removed here. |

A real-world example is a line of people waiting for service. The person who arrives first is served first.

### Queue Operations

| Operation | Description |
|---|---|
| `enqueue` | Adds an item to the rear of the queue. |
| `dequeue` | Removes an item from the front of the queue. |
| `peek` | Views the front item without removing it. |
| `isEmpty` | Checks if the queue has no items. |

### Java Queue Methods

| Method | Description |
|---|---|
| `add(e)` | Inserts an element and may throw an exception if insertion fails. |
| `offer(e)` | Inserts an element and returns whether insertion succeeded. |
| `element()` | Returns the front item but may throw an exception if empty. |
| `peek()` | Returns the front item or `null` if empty. |
| `remove()` | Removes and returns the front item; may throw an exception if empty. |
| `poll()` | Removes and returns the front item or `null` if empty. |

Queues may be implemented using arrays, linked lists, pointers, or built-in collection classes.

---

<!-- kind: activity -->
## Activity 8: Queue Simulation

In these exercises, each letter represents data and each asterisk `*` means remove the oldest available item using queue behavior.

Example:

```text
CO*MPU**T*ERS**
```

Read from left to right:

- letters are enqueued
- `*` dequeues the front item

Process each string and write the final queue contents:

1. `DATA***STRUCT***URES_AND_*****ALGORITHMS`
2. `INFORM******ATION_***TECHNOL*****OGY***`
3. `CUS***TOMI***ZING***_WIND****OWS**`
4. `DATA**_STRU***CTU*RES**`
5. `AL*G**ORIT***HMS**`
6. `SO**FT**WA*RE_EN**GINE**ERIN**G**`
7. `C**OM*PU*TER**_PRO**GRA**MMING****`

---

<!-- kind: activity -->
## Activity 9: Java Queue Program

Create a queue that stores 10 odd numbers. Then remove the first number and the last number.

```java
import java.util.LinkedList;
import java.util.Queue;

public class OddQueueDemo {
    public static void main(String[] args) {
        Queue<Integer> numbers = new LinkedList<>();

        for (int n = 1; n <= 19; n += 2) {
            numbers.offer(n);
        }

        System.out.println("Original queue: " + numbers);

        Integer firstRemoved = numbers.poll();

        LinkedList<Integer> editable = new LinkedList<>(numbers);
        Integer lastRemoved = editable.removeLast();

        System.out.println("Removed first: " + firstRemoved);
        System.out.println("Removed last: " + lastRemoved);
        System.out.println("Updated queue: " + editable);
    }
}
```

---

<!-- kind: content -->
## Module 7: Tree Data Structure

A **tree** is a nonlinear data structure made of vertices and edges. It is commonly used to represent hierarchy, such as folders, organization charts, decision processes, and search structures.

A tree has a starting node called the **root**. From the root, other nodes branch downward.

### Important Tree Terms

| Term | Meaning |
|---|---|
| Vertex / node | A data item in the tree. |
| Edge | A connection between two nodes. |
| Path | A sequence of connected nodes. |
| Root | The top node of the tree. |
| Parent | A node directly above another node. |
| Child | A node directly below another node. |
| Leaf / terminal node | A node with no children. |
| Nonterminal / internal node | A node with at least one child. |
| Subtree | A smaller tree formed by a node and its descendants. |
| Forest | A set of separate trees. |
| Level | A node's distance from the root. |
| Height | The largest level in the tree. |
| Path length | The sum of node levels in a tree. |

### Binary Tree

A **binary tree** is a tree where each node can have at most two children: a left child and a right child.

Binary trees are useful because they combine some advantages of arrays and linked lists. In certain forms, such as binary search trees, searching can be faster than scanning a list, while insertion and deletion can remain flexible.

### Diagram Description

A tree diagram usually shows the root at the top, with edges connecting it to lower nodes. Leaves appear at the bottom or at endpoints of branches.

Example summary for a tree made from the letters of `COMPUTERS`:

```text
Vertices: C, O, M, P, U, T, E, R, S
Root: U
Leaf nodes: C, P, T, S
Internal nodes: U, M, E, O, R
```

---

<!-- kind: activity -->
## Activity 10: Build a Complete Binary Tree

Create a complete binary tree from each of the following phrases. Then identify the root, paths, vertices, leaf nodes, internal nodes, edges, levels, height, and path length.

1. `DATA_STRUCTURE_AND_ALGORITHMS`
2. `COMMUNICATION_TECHNOLOGY`
3. `COMPUTER_SCIENCE`
4. `INFORMATION_TECHNOLOGY`
5. `SOFTWARE_DEVELOPMENT`

> Note: One institution-specific phrase from the source activity was replaced with a generic computing-related phrase.

---

<!-- kind: content -->
## Module 8: Tree Traversal

**Tree traversal** is the process of visiting every node in a tree exactly once. Traversal is important when printing, searching, evaluating, or copying tree structures.

For binary trees, the common traversal methods are:

| Traversal | Order |
|---|---|
| Preorder | Visit root, then left subtree, then right subtree. |
| Inorder | Visit left subtree, then root, then right subtree. |
| Postorder | Visit left subtree, then right subtree, then root. |
| Level order | Visit nodes level by level from left to right. |

### Preorder Traversal

Preorder visits the root before its subtrees.

```text
Root -> Left -> Right
```

This is useful when copying a tree or displaying a prefix expression.

### Inorder Traversal

Inorder visits the left subtree first, then the root, then the right subtree.

```text
Left -> Root -> Right
```

For a binary search tree, inorder traversal displays values in sorted order.

### Postorder Traversal

Postorder visits both subtrees before the root.

```text
Left -> Right -> Root
```

This is useful when deleting a tree or evaluating postfix expressions.

### Level-Order Traversal

Level-order traversal visits nodes from top to bottom, moving left to right at each level. It is commonly implemented using a queue.

---

<!-- kind: activity -->
## Activity 11: Tree Traversal Practice

For each phrase below:

1. Create a complete binary tree.
2. Write the preorder traversal.
3. Write the inorder traversal.
4. Write the postorder traversal.
5. Write the level-order traversal.

Phrases:

1. `DATA_STRUCTURE_AND_ALGORITHMS`
2. `COMPUTER_PROGRAMMING`

### Java Programming Task

Write a Java program that displays the preorder, inorder, postorder, and level-order traversal of a binary tree.

```java
import java.util.LinkedList;
import java.util.Queue;

class Node {
    String value;
    Node left;
    Node right;

    Node(String value) {
        this.value = value;
    }
}

public class TreeTraversalDemo {
    static void preorder(Node node) {
        if (node == null) return;
        System.out.print(node.value + " ");
        preorder(node.left);
        preorder(node.right);
    }

    static void inorder(Node node) {
        if (node == null) return;
        inorder(node.left);
        System.out.print(node.value + " ");
        inorder(node.right);
    }

    static void postorder(Node node) {
        if (node == null) return;
        postorder(node.left);
        postorder(node.right);
        System.out.print(node.value + " ");
    }

    static void levelOrder(Node root) {
        if (root == null) return;

        Queue<Node> queue = new LinkedList<>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            Node current = queue.poll();
            System.out.print(current.value + " ");

            if (current.left != null) queue.offer(current.left);
            if (current.right != null) queue.offer(current.right);
        }
    }

    public static void main(String[] args) {
        Node root = new Node("A");
        root.left = new Node("B");
        root.right = new Node("C");
        root.left.left = new Node("D");
        root.left.right = new Node("E");

        System.out.print("Preorder: ");
        preorder(root);

        System.out.print("\nInorder: ");
        inorder(root);

        System.out.print("\nPostorder: ");
        postorder(root);

        System.out.print("\nLevel order: ");
        levelOrder(root);
    }
}
```

---

<!-- kind: content -->
## Module 9: Selection Sort

**Selection sort** is a simple sorting algorithm. It repeatedly finds the smallest value in the unsorted part of the list and moves it into the next correct position.

Selection sort is easy to understand and implement, but it is usually inefficient for large lists because it repeatedly scans the remaining elements.

### Selection Sort Steps

1. Start at the first position.
2. Find the smallest value in the unsorted part of the list.
3. Swap it with the value in the current position.
4. Move to the next position.
5. Repeat until the list is sorted.

### Example

Given:

```text
{5, 1, 12, -5, 16, 2, 12, 14}
```

A possible selection-sort progression is:

```text
Start:     {5, 1, 12, -5, 16, 2, 12, 14}
Pass 1:    {-5, 1, 12, 5, 16, 2, 12, 14}
Pass 2:    {-5, 1, 12, 5, 16, 2, 12, 14}
Pass 3:    {-5, 1, 2, 5, 16, 12, 12, 14}
Pass 4:    {-5, 1, 2, 5, 16, 12, 12, 14}
Pass 5:    {-5, 1, 2, 5, 12, 16, 12, 14}
Pass 6:    {-5, 1, 2, 5, 12, 12, 16, 14}
Pass 7:    {-5, 1, 2, 5, 12, 12, 14, 16}
```

Final sorted list:

```text
{-5, 1, 2, 5, 12, 12, 14, 16}
```

---

<!-- kind: activity -->
## Activity 12: Selection Sort Practice

Manually sort each list using selection sort. Show the list after each pass.

1. `{5, 1, 2, 15, -4, 12, 14, 16, 0, 3, 9}`
2. `{25, 1, 2, 5, 22, -12, 14, 16, 23, -1}`
3. `{8, 1, 2, 5, 22, -12, 67, 14, 16, 23, -1}`
4. `{a, j, d, r, g, w, q, p, r, s, a, b, t}`
5. `{Apple, Lemon, Mango, Watermelon, Banana}`

### Java Selection Sort Program

```java
import java.util.Arrays;

public class SelectionSortDemo {
    public static void selectionSort(int[] arr) {
        for (int i = 0; i < arr.length - 1; i++) {
            int minIndex = i;

            for (int j = i + 1; j < arr.length; j++) {
                if (arr[j] < arr[minIndex]) {
                    minIndex = j;
                }
            }

            int temp = arr[i];
            arr[i] = arr[minIndex];
            arr[minIndex] = temp;
        }
    }

    public static void main(String[] args) {
        int[] values = {5, 1, 2, 15, -4, 12, 14, 16, 0, 3, 9};
        selectionSort(values);
        System.out.println(Arrays.toString(values));
    }
}
```

---

<!-- kind: content -->
## Module 10: Quick Sort

**Quick sort** is a divide-and-conquer sorting algorithm. It chooses a value called a **pivot**, partitions the list around that pivot, and then recursively sorts the smaller partitions.

After partitioning:

- values smaller than the pivot are placed on one side
- values greater than the pivot are placed on the other side
- the pivot ends up in its sorted position

### Common Pivot Choices

A quick sort implementation may choose:

1. the first element
2. the last element
3. a random element
4. a median-like value

### Partitioning

The partition step is the key part of quick sort. Given a pivot, the algorithm rearranges the array so the pivot is placed where it belongs in the sorted order.

Example:

```text
Original:  {10, 3, 30, 25, 48, 4, 36}
Sorted:    {3, 4, 10, 25, 30, 36, 48}
```

Quick sort reaches the sorted result by repeatedly partitioning smaller sections of the list.

---

<!-- kind: activity -->
## Activity 13: Java Quick Sort Program

Run the program below and trace how the array changes during sorting.

```java
import java.util.Arrays;

public class QuickSortDemo {
    static void swap(int[] arr, int first, int second) {
        int temp = arr[first];
        arr[first] = arr[second];
        arr[second] = temp;
    }

    static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int smallerIndex = low - 1;

        for (int current = low; current < high; current++) {
            if (arr[current] < pivot) {
                smallerIndex++;
                swap(arr, smallerIndex, current);
            }
        }

        swap(arr, smallerIndex + 1, high);
        return smallerIndex + 1;
    }

    static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            int pivotIndex = partition(arr, low, high);
            quickSort(arr, low, pivotIndex - 1);
            quickSort(arr, pivotIndex + 1, high);
        }
    }

    public static void main(String[] args) {
        int[] values = {10, 7, 8, 9, 1, 5};
        quickSort(values, 0, values.length - 1);
        System.out.println("Sorted array: " + Arrays.toString(values));
    }
}
```

### Quick Sort Practice

Sort each list using quick sort. Show the chosen pivot and the partitions after each major step.

1. `(45, 3, 51, 7, 90, 12, 52, 14, 10, 61, 9)`
2. `(25, 35, 5, 17, 70, 15, 12, 14, 52)`
3. `(45, 31, 15, 72, 76, 12, 52, 10, 7, 65)`

---

<!-- kind: content -->
## Review Notes for the Study App

### Removed or generalized

- Institution-specific wording and school-identifying activity terms were removed or replaced with generic computing examples.
- External tutorial links from the source file were not included in the student-facing draft.
- Administrative lesson framing was reduced to study-focused module titles and learning content.

### Flagged for review

⚠️ REVIEW: Some programming examples in the source appear to be standard tutorial-style examples. They were rewritten and simplified here, but you may still want to run a plagiarism/similarity check before publishing in a public app.

⚠️ REVIEW: The source contains several diagram-heavy list and tree exercises. I converted the important diagrams into text descriptions and practice instructions. If the app supports visuals, these could be redrawn as original diagrams later.
