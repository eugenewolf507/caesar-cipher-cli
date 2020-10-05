# caesar-cipher-cli

caesar-cipher-cli

How to start caesar-cipher-cli

0. Don`t forget npm install for first start
1. Open comand line in folder caesar-cipher-cli
2. Type "\$ node app caesar" and options from below

CLI tool accept 4 options (short alias and full name):
-s, --shift: a shift
-i, --input: an input file
-o, --output: an output file
-a, --action: an action encode/decode

Usage example:
$ node caesar -a encode -s 7 -i "./input.txt" -o "./output.txt"
$ node caesar --action encode --shift 7 --input plain.txt --output encoded.txt
\$ node caesar --action decode --shift 7 --input decoded.txt --output plain.txt
