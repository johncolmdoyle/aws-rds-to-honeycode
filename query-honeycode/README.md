# Find the UUIDs used by Honeycode 

To update our table in Honeycode, we need to know what the UUID is.

First we need to identify the workbook uuid, and then find the tables associated with that workbook.

## How To

You will need to provide your Honeycode login credentials to the program.

First we retirieve all the workbooks in your account:
```
$ npm install
$ node index.js workbooks -u USERNAME -p "PASSWORD"
Workbook Name	Workbook UUID
-------------	-------------
Workbook1 => arn:aws:sheets:us-west-2:1234567890:workbook:a132hkhk-i7yugy-ihijk--3f409c8fc35a
```

Then we pass this into the next command:
```
$ node index.js tables -u USERNAME -p "PASSWORD" -w "arn:aws:sheets:us-west-2:1234567890:workbook:a132hkhk-i7yugy-ihijk-3f409c8fc35a"
Workbook Name   Workbook UUID
-------------   -------------
Table1 => arn:aws:sheets:us-west-2:1234567890:sheet:a132hkhk-i7yugy-ihijk-3f409c8fc35a/b2cdc524-4085-352f-86b9-c7c956eb9da2
Table2 => arn:aws:sheets:us-west-2:1234567890:sheet:a132hkhk-i7yugy-ihijk-3f409c8fc35a/aa71e742-1e32-4882-9f18-e45a7bb555dc
Table3 => arn:aws:sheets:us-west-2:1234567890:sheet:a132hkhk-i7yugy-ihijk-3f409c8fc35a/a39790d1-e09b-48a8-9e97-5cf4c671f5e9
```
