function nicknameFunction(){
		if (yesNick.checked){
      nick.style.display="inline";
      nickname.setAttribute('required',true);
		}
		else{ 
			nickname.removeAttribute('required');
			nick.style.display="none";
		}
	}

 function billingFunction() {
  if (document.getElementById('same').checked) {
    document.getElementById('billingName').value = document.getElementById('shippingName').value; 
    document.getElementById('billingZip').value = document.getElementById('shippingZip').value; 
  }
  else {
    document.getElementById('billingName').value = "";
    document.getElementById('billingZip').value = "";
  }
}

function Submit(){

	var email1 = document.getElementById('email_addr');
    var email2 = document.getElementById('email_repeat');
    if (email1.value != email2.value) {
    	alert("The two emails must match!!");
    	return false;
    }

	var pass1 = document.getElementById('password');
    var pass2 = document.getElementById('password_repeat');
    if (pass1.value != pass2.value) {
    	alert("The two passwords must match!!");
    	return false;
    	
    }
	alert("Thank You, your form is submitted. :-)")
}


