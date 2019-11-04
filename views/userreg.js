<html>

	<head>	
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
 		<script src="userreg"></script>	
		<title>User Registration</title>
		

	</head>	

	<body>
		 <div class="text-center" style="margin-top:10px">
			<button class="btn btn-dark" ><a href="/">Home</a></button>
		</div>
		<div align="center">
			<h2>New User Registration</h2>
			
			<form action="userreg" method="POST">
				    <table cellpadding="20" border-spacing:0 15px cellspacing="10" >
				     
                	<tr>
                    <td>SSN</td><td>: <input type="text" name="SSN" required>  format: xxx-xx-xxxx</td> 
                 </tr>

                 <tr>
                    <td>First Name</td><td>: <input type="text" name="fname" required></td>
                 </tr>
                 <tr>
                    <td>Last Name</td><td>: <input type="text" name="lname" required></td>
                 </tr>
                 <tr>
                    <td>Email</td><td>: <input type="email" name="email" required></td>
                 </tr>
                 <tr>
                    <td>Address</td><td>: <input type="text" name="address" required></td>
                 </tr>
                 <tr>
                    <td>City</td><td>: <input type="text" name="city" required></td>
                 </tr>
                 <tr>
                    <td>State</td><td>: <input type="text" name="state" required></td>
                 </tr>
                 <tr>
                    <td>Phone</td><td>: <input type="text" name="phone" required></td>
                 </tr>
             </table>
<!-- <div style="margin-top:15px;"> -->

			<input type="submit" class="btn btn-dark ">
<!-- 		</div> -->

			</form>
<script>
<% if(typeof val!=='undefined'){ %>
alert("User with the same SSN already exists in the database") 
<%} %>
</script>



<% if(typeof cardno!=='undefined'){ %>
User Registered Successfully! Library ID of <%=cardno[0].fname %> : <%=cardno[0].card_no %>
<%} %>


		</div>
	</body>	

</html>
