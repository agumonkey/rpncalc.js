# RPNCALC.JS
Darren Stuart Embry RPN Calculator

from:
 - http://dse.webonastick.com/rpncalc/
 - https://web.archive.org/web/20060710065619/http://dse.webonastick.com/rpncalc/

# DESCRIPTION
JavaScript RPN Calculator
How many reverse Poles does it take to change a light bulb?

I wrote this program for efficient keyboard entry, not for mousey-clicky-clicky like most JavaScript calculator applications are. If you don't see a blinking cursor in the ENTRY box, just click in that box to continue.

This is not guaranteed to work. I'm only developing for Firefox at this time.

# HELP

- Numeric Entry
digits: 0-9 . e
minus sign: _
change sign: ~
ENTER when done

- Examples
5       _5   3.2
3.2e6   _3.2e_6

- Unary Ops
s   sin
c   cos
t   tan
a   atan
l   ln(x)
p   e^x
v   sqrt(x)
r   1/x

- Binary Ops
+ - * / ^ %

- Stack Ops
d   dup
X   exchange
x   pop
C   clear

- Multi-Character
Type ' then one of these strings then '.

- Functions
'sin'  'cos' 'tan'
'atan' 'ln'  'exp'
'sqrt'

- Constants
'pi' (3.14159...)
'ee' (2.71828...)

- Numeric Format
N   normal
$   money mode
    (see below)
S,E scientific
F   fixed
P   precision
specify integer before S,E,F,P to change precision

- Text Alignment
L/R left/right

- Miscellaneous
D   restore
    defaults
    
- Money Mode
Anything without a "." or "e" is entered as cents (optional "-" allowed). A "." (or "e") triggers entering dollars.

# Examples
6    =>  $0.06
258  =>  $2.58
5500 => $55.00
_33  => -$0.33
6.   =>  $6.00
_6.2 => -$6.20
Think of "." as kind of like "00", but not quite.
Other Stuff
Z/Y - undo/redo
(history not preserved on page refresh)

# TODO
 - switch between help, history, constants
 - implement undo

# EPILOG
Copyright © 2005 Darren Stuart Embry. This is free software; see the GNU General Public License for copying conditions. There is NO warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. In other words, the author is not responsible for any overdraft charges, transmission of sexually transmitted diseases, house fires, or monkey invasions resulting from the use of this program.

$Id: index.html,v 1.11 2005/08/04 16:25:45 dse Exp $
