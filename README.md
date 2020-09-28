how this is supposed to work:

create a json state.

bind callbacks to its keys.

callbacks will fire when keys change (including getting deleted due to ancestor getting deleted).

they will also fire if descendant of key changes.

callbacks only know that it changed, not HOW. They take no parameters. If you want them to know how it changed, make sure to define them in a way that they do. Define them in a place where they can access the jsonstate instance and remember any previous values you need.