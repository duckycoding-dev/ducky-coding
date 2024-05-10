## "import 'style.module.css'" vs "import styles from 'style.module.css'"

- `import style.module.css` will apply the css file "as is", without renaming anything, by importing it in the source code
- `import styles from style.module.css` will allow to access classes declared in the css file: using classes like this will allow the css modules compiler to hash the class names in order to make them scoped to the component in which are imported and used\
  Be careful that using this type of import **REQUIRES** you to assign the classes inside the component, anything else won't have styles applied: for example, defining a custom style for a div tag like so `div {background-color: red}` won't have any impact on divs inside the component because 1- it is not a style defined for a class, 2- even if it was declared as `.div-class {background-color: red}` it would need to be imported **AND ASSIGNED**
