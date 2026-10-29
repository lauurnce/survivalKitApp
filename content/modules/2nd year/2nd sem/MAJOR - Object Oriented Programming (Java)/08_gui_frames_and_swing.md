# GUI Frames and Swing
<!-- subject: Object-Oriented Programming with Java | year: 2nd -->

<!-- kind: content -->
## Lesson Overview
This lesson introduces graphical user interface (GUI) programming in Java using Swing. It covers frames, common GUI components, layouts, event handling, lists, combo boxes, panels, and menus.

<!-- kind: content -->
## GUI Components
A GUI component is an on-screen object that users interact with through the mouse, keyboard, or another input device.

Common Swing components:

| Component | Purpose |
|---|---|
| `JFrame` | Main window for a desktop GUI program |
| `JLabel` | Displays text or an image that the user cannot directly edit |
| `JTextField` | Accepts one line of user input |
| `JButton` | Runs code when clicked |
| `JCheckBox` | Represents an option that can be selected or cleared |
| `JRadioButton` | Represents one option in a group of choices |
| `JComboBox` | Displays a drop-down list |
| `JList` | Displays a list of selectable items |
| `JPanel` | Groups components inside a container |
| `JMenuBar`, `JMenu`, `JMenuItem` | Build menus |

<!-- kind: content -->
## Swing Overview
Swing classes are found mainly in `javax.swing`. Many Swing components are lightweight, meaning they are drawn and managed mostly by Java rather than relying completely on the operating system's native widgets.

Swing GUI classes build on Java's class hierarchy. For example, `JFrame` is a window, and many components inherit shared behavior from classes such as `Component` and `Container`.

<!-- kind: content -->
## JFrame Basics
A `JFrame` is a top-level window. Common frame tasks include setting the title, size, layout, close operation, and visibility.

<!-- kind: activity -->
## Activity: Basic JFrame
```java
import javax.swing.JFrame;

public class BasicFrameDemo extends JFrame {
    public BasicFrameDemo() {
        super("Basic Frame");
        setSize(300, 200);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setVisible(true);
    }

    public static void main(String[] args) {
        new BasicFrameDemo();
    }
}
```

<!-- kind: content -->
## Labels and Text Fields
`JLabel` displays text or icons. `JTextField` lets the user type a single line of text.

<!-- kind: activity -->
## Activity: Label and Text Field
```java
import java.awt.FlowLayout;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JTextField;

public class LabelTextDemo extends JFrame {
    private JLabel nameLabel;
    private JTextField nameField;

    public LabelTextDemo() {
        super("Label and Text Field");
        setLayout(new FlowLayout());

        nameLabel = new JLabel("Name:");
        nameField = new JTextField(15);

        add(nameLabel);
        add(nameField);

        setSize(300, 120);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setVisible(true);
    }

    public static void main(String[] args) {
        new LabelTextDemo();
    }
}
```

<!-- kind: content -->
## Buttons and Action Events
A `JButton` can respond to clicks using an `ActionListener`. The listener's `actionPerformed()` method runs when the button is clicked.

<!-- kind: activity -->
## Activity: Button Click Event
```java
import java.awt.FlowLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JOptionPane;

public class ButtonDemo extends JFrame {
    private JButton button;

    public ButtonDemo() {
        super("Button Demo");
        setLayout(new FlowLayout());

        button = new JButton("Click me");
        button.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent event) {
                JOptionPane.showMessageDialog(null, "Button clicked!");
            }
        });

        add(button);
        setSize(250, 120);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setVisible(true);
    }

    public static void main(String[] args) {
        new ButtonDemo();
    }
}
```

<!-- kind: content -->
## Check Boxes and Radio Buttons
A `JCheckBox` lets users choose independent options. A `JRadioButton` is usually placed in a `ButtonGroup` so only one option in the group can be selected at a time.

<!-- kind: activity -->
## Activity: Check Box and Radio Button
```java
import java.awt.FlowLayout;
import javax.swing.ButtonGroup;
import javax.swing.JCheckBox;
import javax.swing.JFrame;
import javax.swing.JRadioButton;

public class ChoiceDemo extends JFrame {
    public ChoiceDemo() {
        super("Choices");
        setLayout(new FlowLayout());

        JCheckBox bold = new JCheckBox("Bold");
        JCheckBox italic = new JCheckBox("Italic");

        JRadioButton small = new JRadioButton("Small");
        JRadioButton large = new JRadioButton("Large");
        ButtonGroup sizeGroup = new ButtonGroup();
        sizeGroup.add(small);
        sizeGroup.add(large);

        add(bold);
        add(italic);
        add(small);
        add(large);

        setSize(300, 150);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setVisible(true);
    }

    public static void main(String[] args) {
        new ChoiceDemo();
    }
}
```

<!-- kind: content -->
## Combo Boxes and Lists
`JComboBox` is useful for choosing one item from a drop-down list. `JList` displays several items at once and can allow single or multiple selections.

<!-- kind: activity -->
## Activity: Combo Box
```java
import java.awt.FlowLayout;
import javax.swing.JComboBox;
import javax.swing.JFrame;
import javax.swing.JLabel;

public class ComboBoxDemo extends JFrame {
    public ComboBoxDemo() {
        super("Combo Box Demo");
        setLayout(new FlowLayout());

        JLabel label = new JLabel("Choose language:");
        String[] languages = {"Java", "Python", "C++", "JavaScript"};
        JComboBox<String> comboBox = new JComboBox<>(languages);

        add(label);
        add(comboBox);

        setSize(300, 120);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setVisible(true);
    }

    public static void main(String[] args) {
        new ComboBoxDemo();
    }
}
```

<!-- kind: activity -->
## Activity: JList
```java
import java.awt.FlowLayout;
import javax.swing.JFrame;
import javax.swing.JList;
import javax.swing.JScrollPane;
import javax.swing.ListSelectionModel;

public class ListDemo extends JFrame {
    public ListDemo() {
        super("List Demo");
        setLayout(new FlowLayout());

        String[] subjects = {"OOP", "Database", "Networking", "Web Development"};
        JList<String> list = new JList<>(subjects);
        list.setVisibleRowCount(3);
        list.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);

        add(new JScrollPane(list));

        setSize(300, 180);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setVisible(true);
    }

    public static void main(String[] args) {
        new ListDemo();
    }
}
```

<!-- kind: content -->
## Layout Managers
A layout manager controls how components are placed inside a container.

Common layout managers:

| Layout | Behavior |
|---|---|
| `FlowLayout` | Places components left to right, wrapping as needed |
| `BorderLayout` | Places components in `NORTH`, `SOUTH`, `EAST`, `WEST`, and `CENTER` regions |
| `GridLayout` | Places components in equal-sized rows and columns |

<!-- kind: activity -->
## Activity: JPanel with Layouts
```java
import java.awt.BorderLayout;
import java.awt.GridLayout;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JPanel;

public class PanelLayoutDemo extends JFrame {
    public PanelLayoutDemo() {
        super("Panel Layout Demo");

        JPanel panel = new JPanel(new GridLayout(2, 2));
        panel.add(new JButton("One"));
        panel.add(new JButton("Two"));
        panel.add(new JButton("Three"));
        panel.add(new JButton("Four"));

        add(panel, BorderLayout.CENTER);

        setSize(300, 200);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setVisible(true);
    }

    public static void main(String[] args) {
        new PanelLayoutDemo();
    }
}
```

<!-- kind: content -->
## Menus with Frames
Swing menus are built with `JMenuBar`, `JMenu`, and `JMenuItem`. Menus can also contain separators, radio button menu items, and checkbox menu items.

A menu item can respond to clicks using an `ActionListener`.

<!-- kind: activity -->
## Activity: Basic Menu
```java
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import javax.swing.JFrame;
import javax.swing.JMenu;
import javax.swing.JMenuBar;
import javax.swing.JMenuItem;

public class MenuDemo extends JFrame {
    public MenuDemo() {
        super("Menu Demo");

        JMenuBar menuBar = new JMenuBar();
        JMenu fileMenu = new JMenu("File");
        JMenuItem exitItem = new JMenuItem("Exit");

        exitItem.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent event) {
                System.exit(0);
            }
        });

        fileMenu.add(exitItem);
        menuBar.add(fileMenu);
        setJMenuBar(menuBar);

        setSize(300, 200);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setVisible(true);
    }

    public static void main(String[] args) {
        new MenuDemo();
    }
}
```

<!-- kind: activity -->
## Laboratory Exercises
1. Create a frame that contains a label, text field, and button. When the button is clicked, show the text field value in a dialog box.
2. Create a frame with check boxes for text styles and update a label's font style based on the selected boxes.
3. Create a frame with radio buttons for color choices and update a label's text color based on the selected choice.
4. Create a combo box or list that lets the user choose a subject, then display the selected subject.
5. Create a frame with a menu bar containing a File menu and an Exit menu item.
