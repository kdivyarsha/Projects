var express = require('express');
var http = require('http');
var bodyParser  = require("body-parser");
var path = require('path');
var app = express();


var connection  = require('express-myconnection'); 
var mysql = require('mysql');

// all environments
app.set('port', process.env.PORT || 4010);
app.use(bodyParser.urlencoded({extended: false}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.methodOverride());
//app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
app.use(
    
    connection(mysql,{
        
        host: 'localhost', //'localhost',
        user: 'root',
        password : 'divya',
        port : 3306, //port mysql
        database:'library'

    },'pool') //or single

);

var today = new Date();
var dd = today.getDate();

var mm = today.getMonth()+1; 
var yyyy = today.getFullYear();
if(dd<10) 
{
    dd='0'+dd;
} 

if(mm<10) 
{
    mm='0'+mm;
} 
today = yyyy+'-'+mm+'-'+dd;

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}
var checkoutdate=today;
// console.log(checkoutdate);
var duedate1=new Date();
duedate1.setDate(duedate1.getDate() + 15);
date = new Date(duedate1);
year = date.getFullYear();
month = date.getMonth()+1;
dt = date.getDate();

if (dt < 10) {
  dt = '0' + dt;
}
if (month < 10) {
  month = '0' + month;
}

duedate=year+'-' + month + '-'+dt;
// console.log(duedate)

// var checkoutdate=Date("Y-m-d");
// console.log(checkoutdate)
// var duedate=Date('Y-m-d', strtotime("+15 days"));

app.get("/",function(req,res)
{

	res.render('startpage',{data:null});

});

app.post("/",function(req,res)
{

	var srch=req.body.index;
     if(srch=="")
    res.send("blankerror"); 

    // var srch1=srch.split(" ");
    // console.log(srch1);
    // for(var i=0;i<srch1.length;i++)
    // {
        // var srch=srch1[i];
        // console.log("wtf",srch);
    else {
	req.getConnection(function(err,connection){
        
var q="SELECT a.Isbn,Title,fullname,Availability from book a, book_authors b,authors c where (a.Isbn like '%"+srch+"%' or a.Title like '%"+srch+"%' or c.fullname like '%"+srch+"%') and a.isbn=b.isbn and b.author_id=c.author_id"       
 var query = connection.query(q,[srch,srch,srch],function(err,rows)
        {
            
            if(err)
                console.log("Error Selecting : %s ",err );
     
            res.send(rows);
                
           
         });
    });
// }
}
});


app.get("/userreg",function(req,res)
{
	res.render("userreg.ejs")
});
app.post("/userreg",function(req,res)
{
	var SSN=req.body.SSN;
	var fname=req.body.fname;
	var lname=req.body.lname;
	var email=req.body.email;
	var address=req.body.address;
	var city=req.body.city;
	var state=req.body.state;
	var phone=req.body.phone;
	req.getConnection(function(err,connection){
		var q="SELECT * from borrower where ssn=?"
		var query = connection.query(q,[SSN],function(err,rows)
		{
			if(err)
                console.log("Error Selecting : %s ",err );
            if(rows.length>0)
            {
            	res.render("userreg",{val:1})
            }
            else
            {
            	var p = "Insert into borrower(ssn,fname,lname,email,address,city,state,phone) values(?,?,?,?,?,?,?,?)"
            	var query = connection.query(p,[SSN,fname,lname,email,address,city,state,phone],function(err,rows)
            	{
            		if(err)
                console.log("Error Selecting : %s ",err );
            var l= "Select card_no,fname from borrower where ssn=?"

            var query = connection.query(l,[SSN],function(err,rows)
            {
            	console.log(rows);
            	if(err)
            		console.log("Error Selecting : %s ",err );
            	else
            	{
            		res.render("userreg",{cardno:rows})
            	}
            });

            	})
            }
            
            
		

		})
	})
});
app.post("/checkout",function(req,res){
    var book1=req.body.index1;
    var book2=req.body.index2;
    var book3=req.body.index3;
    var cardid=req.body.index4;
    var length=req.body.index5;
    // console.log(book1,book2,book3,cardid,length)
    req.getConnection(function(err,connection){
        var check="select * from borrower where card_no=?";
        var checkquery= connection.query(check,[cardid],function(err,rows)
        {
            console.log("rowsdata",rows);
            if(rows.length==0) res.send("nocardno");
            else
            {
        var q= "select Loan_id from book_loans where Card_id=? and Date_in='0000-00-00'"; 
        var query = connection.query(q,[cardid],function(err,rows)
        {
            console.log(rows);
            console.log(rows.length)
            var no=rows.length;
            var totalbooks= parseFloat(length)+parseFloat(no);
            var cantake= 3-parseFloat(no);
            console.log("tb",totalbooks);
            console.log(totalbooks>3)
            if(totalbooks>3){
            res.send("morethan3books");
       } else
             {  if(book1!=undefined)
                {
                var b1="insert into book_loans (Isbn,Card_id,Date_out,Due_date,Date_in) values(?,?,?,?,?)"
                var q1 = connection.query(b1,[book1,cardid,checkoutdate,duedate,'0000-00-00'],function(err,rows)
                {
                    console.log("inb1")
                    if(err) 
                        {console.log("inb1Error Selecting : %s",err);
                    } else {
                        s2="update book set availability='Not available' where Isbn=? ";
                        var q2 = connection.query(s2,[book1],function(err)
                        {
                            if(err)
                           {  console.log("Error Selecting : %s ",err );
                         }
                         
                         // else
                        //  {
                        //     res.send("success")
                        //  }
                        });
                    }
                });
            }
                if(book2!=undefined)
                {
                var b2="insert into book_loans (Isbn,Card_id,Date_out,Due_date,Date_in) values(?,?,?,?,?)"
                var q2 = connection.query(b2,[book2,cardid,checkoutdate,duedate,'0000-00-00'],function(err,rows)
                {
                    if(err) 
                        {console.log("inb2Error Selecting : %s",err);
                    } else {
                        s2="update book set availability='Not available' where Isbn=? ";
                        var q3 = connection.query(s2,[book2],function(err)
                        {
                            if(err)
                           {  console.log("Error Selecting : %s ",err );
                         }

                        });
                    }
                });
            }

                if(book3!=undefined)
                {
                var b3="insert into book_loans (Isbn,Card_id,Date_out,Due_date,Date_in) values(?,?,?,?,?)"
                var q3 = connection.query(b3,[book3,cardid,checkoutdate,duedate,'0000-00-00'],function(err,rows)
                {
                    if(err) 
                        {console.log("inb3Error Selecting : %s",err);
                    } else {
                        s3="update book set availability='Not available' where Isbn=? ";
                        var q4 = connection.query(s3,[book3],function(err)
                        {
                            if(err)
                           {  console.log("Error Selecting : %s ",err );
                         }
                        });
                    }
                });
            }

            var fine= "Insert into fines select book_loans.Loan_id,?,0,0 from Book_loans where card_id=? and date_in='0000-00-00' and date_out=? and Loan_id not in (select Loan_id from `fines`)";
            var finequery=connection.query(fine,[cardid,cardid,today],function(err)
            {
                if(err) 
                        {console.log("infineError Selecting : %s",err);
                }else
                {
                    res.send("Success");
                }
            })

        }
        });
    }
        });

    });
    
	
})

app.get("/usercheckin",function(req,res)
{
	res.render("usercheckin.ejs")
});

app.post("/checkin",function(req,res)
{
    var srch=req.body.srch;
    console.log(req.body.srch);
    req.getConnection(function(err,connection){
    var q="select book_loans.Loan_id, book_loans.Isbn, book_loans.Card_id, borrower.fname, borrower.lname, book.Title FROM book_loans LEFT JOIN borrower ON book_loans.Card_id=borrower.card_no LEFT JOIN book ON book_loans.Isbn=book.Isbn where (book_loans.Isbn=? or book_loans.Card_id=? or borrower.fname like '%"+srch+"%' or borrower.lname like '%"+srch+"%') AND book_loans.Date_in='0000-00-00'"
    var query=connection.query(q,[srch,srch,srch,srch],function(err,rows)
    {
        if(err)
        {console.log("incheckinError selecting :%s",err);
   } else
    {

        if(rows.length==0)
        {
            res.send('noloans');

        }
        else
           res.send(rows); 
        
    }

    });
})
});

app.post("/loanid",function(req,res)
{
    var loanid=req.body.loanid;
    console.log(req.body);
    req.getConnection(function(err,connection)
    {
        var q="SELECT Date_out, Due_date, Card_id, Isbn FROM book_loans WHERE Loan_id=?"
        var query=connection.query(q,[loanid],function(err,rows)
        {
            if(err)
        console.log("Error selecting :%s",err);
    else 
        {
            if(rows.length>0)
            {
                // var dateout=rows.Date_out;
                var dateout=rows[0].Date_out;
                var duedate=rows[0].Due_date;
                var cardid=rows[0].Card_id;
                var checkindate= checkoutdate;
                duedate=formatDate(duedate); 
                checkindate=new Date(checkindate);
                duedate=new Date(duedate);
                var diffTime = duedate - checkindate;

                var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
               if(diffDays>=0)
               {
                res.send("nofine");
               }
               else
               {

                    var fine=Math.abs(diffDays*0.25);
                    console.log("fine",fine);
                    console.log(loanid);
                    var f="SELECT Loan_id FROM fines WHERE Loan_id=?"
                    var fquery=connection.query(f,[loanid],function(err,rows)
                    {
                        if(err)
                        console.log("infError selecting :%s",err);
                    else
                    {
                        console.log(rows.length);
                        if(rows.length>0){

                        var f1="UPDATE fines SET Fine_amt=? WHERE Loan_id=?"
                        var f1query=connection.query(f1,[fine,loanid],function(err)
                        {
                        if(err)
                        console.log("inf1Error selecting :%s",err);

                        });
                    }else {
                        var f2="INSERT INTO fines (Loan_id,Card_id,Fine_amt,Paid) VALUES (?,?,?,0)"
                        var f2query=connection.query(f2,[loanid,cardid,fine],function(err)
                        {
                            if(err)
                        console.log("Error selecting :%s",err);
                        })
                    }

                    }
                    });
                    res.send(fine.toString());

               }

            }


        }
   
        })
    })


})

app.post("/confirmcheckin",function(req,res)
{
    console.log(req.body);
    var checkinid=req.body.checkinid;
    var isbn=req.body.isbn;
    var date=checkoutdate;
    req.getConnection(function(err,connection)
    {
    var q="UPDATE book_loans SET Date_in=? WHERE Loan_id=?";
    var query=connection.query(q,[date,checkinid],function(err,rows)
    {
        if(err)
        {
            console.log("inconfirmchekin Error selecting :%s",err);
        }
        var q1="UPDATE book SET Availability='Available' WHERE Isbn=?"
        var query1=connection.query(q1,[isbn],function(err,rows)
    {
        if(err)
        {
            console.log("inconfirmchekinq1 Error selecting :%s",err);
        }

         var q2="DELETE FROM fines WHERE Loan_id=?"
    var query2=connection.query(q2,[checkinid],function(err,rows)
    {
        if(err)
        {
            console.log("inconfirmchekinq2 Error selecting :%s",err);
        }
        
    });
    });

    });  
    res.send("Successful");
    console.log("Successful");
    });

})
app.post("/payconfirmcheckin",function(req,res)
{
    console.log(req.body);
    var paycheckinid=req.body.paycheckinid;
    var isbn= req.body.isbn;
    date=checkoutdate;
    req.getConnection(function(err,connection)
    {
    var q="UPDATE book_loans SET Date_in=? WHERE Loan_id=?"
    var query=connection.query(q,[date,paycheckinid],function(err,rows)
    {
        if(err)
        {
            console.log("payinconfirmchekin Error selecting :%s",err);
        }
        var q1="UPDATE fines SET Paid=1 WHERE Loan_id=?"
        var query1=connection.query(q1,[paycheckinid],function(err,rows)
    {
        if(err)
        {
            console.log("inpayconfirmchekinq1 Error selecting :%s",err);
        }

         var q2="UPDATE book SET Availability='Available' WHERE Isbn=?"
    var query2=connection.query(q2,[isbn],function(err,rows)
    {
        if(err)
        {
            console.log("inpayconfirmchekinq2 Error selecting :%s",err);
        }
        
    });
    });

    });

    res.send("Successful");    
    console.log("Successful ");
    });


})

app.get("/fines",function(req,res)
{
    req.getConnection(function(err,connection){
        // var q="Select Loan_id,Card_id,Fine_amt from Fines where Paid=0 && Fine_amt!=0.00"
    var q="Select Loan_id,Card_id,Fine_amt,Paid from Fines"
    var query=connection.query(q,function(err,rows)
    {
        if(err)
        {
            console.log("infinesgetchekinq1 Error selecting :%s",err);
        }
        else
        {
            console.log(rows);
            res.render("fines.ejs",{data:rows});
        }
    });
});

    
});


app.use(app.router);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});