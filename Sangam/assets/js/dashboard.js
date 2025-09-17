(function(){
	function $(sel){ return document.querySelector(sel); }
	function $all(sel){ return Array.prototype.slice.call(document.querySelectorAll(sel)); }

	document.addEventListener('DOMContentLoaded', function(){
		// Tabs
		$all('.tabs a').forEach(function(a){
			a.addEventListener('click', function(e){
				e.preventDefault();
				var target = this.getAttribute('href');
				$all('.tab').forEach(function(t){ t.style.display = 'none'; t.classList.remove('active'); });
				$(target).style.display = '';
				$(target).classList.add('active');
			});
		});

		// Profile: naive placeholders from sessionStorage and browser
		try {
			var step = sessionStorage.getItem('signupStep1');
			if(step){
				var data = JSON.parse(step);
				var role = data.userType === 'alumni' ? 'Alumni' : 'Student';
				var deptOrRole = data.userType === 'alumni' ? (data.currentRole || '-') : (data.department || '-');
				var college = data.collegeName || '-';
				var name = data.fullName || '-';
				document.getElementById('prof-name').textContent = name;
				document.getElementById('prof-role').textContent = role;
				document.getElementById('prof-college').textContent = college;
				document.getElementById('prof-dept').textContent = deptOrRole;
			}
		} catch(e){}
		try {
			var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
			document.getElementById('prof-time').textContent = new Date().toLocaleTimeString();
			document.getElementById('prof-location').textContent = tz;
		} catch(e){}

		// Feed
		var feedForm = document.getElementById('feed-form');
		var feedPost = document.getElementById('feed-post');
		if(feedPost){
			feedPost.addEventListener('click', function(){
				var data = new FormData(feedForm);
				var text = (data.get('text')||'').trim();
				if(!text) return;
				var li = document.createElement('li');
				li.className = 'box';
				li.style.marginBottom = '0.75rem';
				li.textContent = text;
				document.getElementById('feed-list').prepend(li);
				feedForm.reset();
			});
		}

		// Search (mock)
		var searchBtn = document.getElementById('search-btn');
		if(searchBtn){
			searchBtn.addEventListener('click', function(){
				var mode = document.getElementById('search-mode').value;
				var q = (document.getElementById('search-query').value || '').trim();
				var results = document.getElementById('search-results');
				results.innerHTML = '';
				var demo = [
					{ name:'Alice Sharma', role:'Alumni · Software Engineer', location:'Bengaluru', tag:'React' },
					{ name:'Rahul Verma', role:'Student · CSE', location:'Delhi', tag:'AI/ML' }
				];
				demo.filter(function(x){
					if(!q) return true;
					var s = (x.name+' '+x.role+' '+x.location+' '+x.tag).toLowerCase();
					return s.indexOf(q.toLowerCase())>=0;
				}).forEach(function(x){
					var card = document.createElement('div');
					card.className = 'box';
					card.innerHTML = '<strong>'+x.name+'</strong><br/>'+x.role+' · '+x.location+'<br/><em>'+x.tag+'</em>';
					results.appendChild(card);
				});
				if(!results.children.length){
					results.innerHTML = '<div class="box">No results. Try a different query.</div>';
				}
			});
		}

		// Mentorship/Jobs (local only)
		var mentorBtn = document.getElementById('mentor-post');
		var jobBtn = document.getElementById('job-post');
		if(mentorBtn){
			mentorBtn.addEventListener('click', function(){
				var t = document.getElementById('mentor-topic').value.trim();
				if(!t) return;
				var li = document.createElement('li');
				li.className = 'box';
				li.textContent = 'Mentorship offered: '+t;
				document.getElementById('mentorship-list').prepend(li);
				document.getElementById('mentor-topic').value='';
			});
		}
		if(jobBtn){
			jobBtn.addEventListener('click', function(){
				var r = document.getElementById('job-role').value.trim();
				if(!r) return;
				var li = document.createElement('li');
				li.className = 'box';
				li.textContent = 'Job posted: '+r;
				document.getElementById('mentorship-list').prepend(li);
				document.getElementById('job-role').value='';
			});
		}
	});
})();
