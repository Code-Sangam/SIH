(function(){
	function serializeForm(form){
		var data = {};
		Array.prototype.slice.call(form.elements).forEach(function(el){
			if(!el.name) return;
			if((el.type === 'checkbox' || el.type === 'radio') && !el.checked) return;
			data[el.name] = el.value;
		});
		return data;
	}

	function post(url, data){
		return fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		}).then(function(res){ return res.json(); });
	}

	function splitContact(contact){
		if(!contact) return { email: '', mobile: '' };
		var looksLikeEmail = /@/.test(contact);
		if(looksLikeEmail) return { email: contact.trim(), mobile: '' };
		return { email: '', mobile: contact.replace(/\s+/g,'').trim() };
	}

	function gotoRoleProfile(){
		try{
			var step = sessionStorage.getItem('signupStep1');
			if(step){
				var role = JSON.parse(step).userType;
				if(role === 'alumni') window.location.href = 'alumni-profile.html';
				else window.location.href = 'student-profile.html';
				return;
			}
		}catch(e){}
		window.location.href = 'alumni-profile.html';
	}

	document.addEventListener('DOMContentLoaded', function(){
		var studentNextBtn = document.getElementById('student-signup-next');
		var alumniNextBtn = document.getElementById('alumni-signup-next');
		var setPasswordBtn = document.getElementById('set-password-submit');
		var loginBtn = document.getElementById('login-submit');

		if(studentNextBtn){
			studentNextBtn.addEventListener('click', function(){
				var form = document.getElementById('student-signup-form');
				var data = serializeForm(form);
				var step = {
					userType: 'student',
					fullName: data.fullName,
					rollNo: data.rollNo,
					collegeName: data.collegeName,
					department: data.department,
					address: data.address
				};
				sessionStorage.setItem('signupStep1', JSON.stringify(step));
				window.location.href = 'set-password.html';
			});
		}

		if(alumniNextBtn){
			alumniNextBtn.addEventListener('click', function(){
				var form = document.getElementById('alumni-signup-form');
				var data = serializeForm(form);
				var step = {
					userType: 'alumni',
					fullName: data.fullName,
					rollNo: data.rollNo,
					collegeName: data.collegeName,
					currentRole: data.currentRole,
					address: data.address
				};
				sessionStorage.setItem('signupStep1', JSON.stringify(step));
				window.location.href = 'set-password.html';
			});
		}

		if(setPasswordBtn){
			setPasswordBtn.addEventListener('click', function(){
				var form = document.getElementById('set-password-form');
				var data = serializeForm(form);
				if(!data.password || data.password !== data.confirmPassword){
					alert('Passwords do not match');
					return;
				}
				var step = sessionStorage.getItem('signupStep1');
				if(!step){
					alert('Signup session expired. Please start again.');
					window.location.href = 'index.html';
					return;
				}
				var payload = JSON.parse(step);
				var cm = (data.contact||'').trim();
				if(!cm){ alert('Please enter Email ID or Mobile No.'); return; }
				var looksLikeEmail = /@/.test(cm);
				payload.email = looksLikeEmail ? cm : '';
				payload.mobile = looksLikeEmail ? '' : cm.replace(/\s+/g,'');
				payload.password = data.password;
				var endpoint = payload.userType === 'alumni' ? '/api/signup/alumni' : '/api/signup/student';
				post(endpoint, payload).then(function(resp){
					if(resp && resp.success){
						alert('Signup complete.');
						gotoRoleProfile();
					}else{
						alert(resp.message || 'Signup failed');
					}
				}).catch(function(){ alert('Signup failed'); });
			});
		}

		if(loginBtn){
			loginBtn.addEventListener('click', function(){
				var form = document.getElementById('login-form');
				var data = serializeForm(form);
				var cm = (data.contact||'').trim();
				var looksLikeEmail = /@/.test(cm);
				var payload = { email: looksLikeEmail ? cm : '', mobile: looksLikeEmail ? '' : cm.replace(/\s+/g,''), password: data.password };
				post('/api/login', payload).then(function(resp){
					if(resp.success){
						// If server returns role, set it into session so profile link is correct
						if(resp.role){
							try{
								var step = sessionStorage.getItem('signupStep1');
								var info = step ? JSON.parse(step) : {};
								info.userType = resp.role;
								sessionStorage.setItem('signupStep1', JSON.stringify(info));
							}catch(e){}
						}
						gotoRoleProfile();
					}else{
						alert(resp.message || 'Login failed');
					}
				}).catch(function(){ alert('Login failed'); });
			});
		}
	});
})();
