# Style Guide & Philosophy
**Main** points:
- **Guides** should be **short**, **informative**, and **not** get into **unecessary details**, mostly they should **give enough information** so that the **topic makes sense** in the **context of** everything else in **the computer world**.
- **Words** should **often be bolded** to **help guide** the **reader's eye**, allowing them to **read quickly** and extract **important information**.

## Special Markdown Syntax
## Links
All **Terms** should be **linked**. The **linking system** works as **follows**: if you **link** like this in **markdown**:
```markdown
A [GPU](gpu) is used for [graphics](graphics) processing.
```
Then it will **automatically search** for **any guide** in the **tree structure** that is called **gpu.md** and **graphics.md**. If the **file** doesn't **exist**, it **autolinks to Wikipedia**, replacing your **dashes** (-) with **underscores** (-). You **must** use %20 **currently** to have **spaces** which **may be necessary** for **wikipedia articles**.

It **works** like this so if **an article** doesn't exist then it **links to wikipedia**, but if it is **created at some point**, it can **link to this site**.

## Sort order
**Sort order** is **optional**.

If som**e categories** in a **parent category** hav**e a sort or**der, then they will be **sorted first**, then the **rest of the categories** will be **sorted alphabetically** below them.

**Sort order** is used by **numbering categories**. See **below**.

e.g.
1. liteguide
2. Hardware
3. Software
Ethics, Law & Activism

The **last one** doesn't **need** a **sort order** to be at **the end**, because **all the other ones** have a **sort order**.

**Guides themselves** can also have a **sort order** by having the **first line** in the **markdown file** be just **an integer number**.

e.g.
```markdown
2
# GPU
[GPU](https://en.wikipedia.org/wiki/Graphics_processing_unit) stands for **Graphics Processing Unit**.
```
