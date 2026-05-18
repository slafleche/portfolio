I helped build a compatibility theme that bridged the legacy Forum (PHP) and
the new Knowledge Base (React). Same design tokens powered both products:
React consumed them directly via CSS-in-JS; PHP received them through a
compatibility CSS layer. The theme also closed off the free-form HTML / CSS /
JS injection clients had been hanging themselves on. We traded that
flexibility for theme stability, on purpose.

### Two products, one theme

- [Acer Community (Forum)](https://community.acer.com/en/)
- [Acer Answers (Knowledge Base)](https://community.acer.com/en/kb/)
