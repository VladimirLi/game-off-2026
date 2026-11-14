#!/usr/bin/env python3
"""SessionStart: put today's date and the days left to each milestone in front of the agent."""
import datetime as dt
today = dt.date.today()
ms = [("feature freeze", dt.date(2026, 11, 24)), ("submit target", dt.date(2026, 11, 30)),
      ("jam deadline, 13:37 PST", dt.date(2026, 12, 1))]
parts = [f"{n} {d:%a %d %b}: {(d - today).days} days" for n, d in ms if d >= today]
msg = f"Today is {today:%a %d %b %Y}. " + ("; ".join(parts) if parts else "The jam deadline has passed.")
if today > dt.date(2026, 11, 24):
    msg += ". Past feature freeze: only bugs, juice, audio, menus and the itch page; flag any new mechanic or level."
print(msg)
