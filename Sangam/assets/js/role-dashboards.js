(function(){
	function el(tag, cls){ var e = document.createElement(tag); if(cls) e.className = cls; return e; }
	function card(title, subtitle){ var b = el('div','box'); b.innerHTML = '<strong>'+title+'</strong><br/><span>'+subtitle+'</span>'; return b; }
	function sample(list){ return list[Math.floor(Math.random()*list.length)]; }
	function range(n){ return Array.from({length:n}, (_,i)=>i); }

	var alumniNames = ['Aarav Mehta','Isha Kapoor','Rohan Gupta','Meera Nair','Dev Patel','Ananya Rao'];
	var studentNames = ['Nikhil Sharma','Priya Singh','Karan Das','Sneha Roy','Arjun Iyer','Ritu Jain'];
	var roles = ['Software Engineer','Data Scientist','Product Manager','Hardware Engineer','Web Developer'];
	var depts = ['CSE','ECE','ME','IT','AI/ML'];
	var locations = ['Bengaluru','Delhi','Mumbai','Pune','Hyderabad'];

	document.addEventListener('DOMContentLoaded', function(){
		// Alumni dashboard
		if(document.getElementById('alumni-side-nav')){
			populate('al-alumni-list', 6, function(){ return card(sample(alumniNames), sample(roles)+' · '+sample(locations)); });
			populate('al-student-list', 6, function(){ return card(sample(studentNames), sample(depts)+' · '+sample(locations)); });
			populate('al-project-list', 6, function(){ return card('Project '+(Math.random()*100|0), 'By '+sample(alumniNames)); });
			populate('al-profile-projects', 4, function(){ return card('Project '+(Math.random()*100|0), 'Demo'); });
			setCounts('al-followers','al-following','al-project-count');
			wireChat('al-chat-list','al-chat-input','al-chat-send');
			wireSideNavCollapse('al-nav-toggle','alumni-side-nav');
		}

		// Student dashboard
		if(document.getElementById('stu-side-nav')){
			populate('st-alumni-list', 6, function(){ return card(sample(alumniNames), sample(roles)+' · '+sample(locations)); });
			populate('st-student-list', 6, function(){ return card(sample(studentNames), sample(depts)+' · '+sample(locations)); });
			populate('st-project-list', 6, function(){ return card('Project '+(Math.random()*100|0), 'By '+sample(studentNames)); });
			populate('st-profile-projects', 4, function(){ return card('Project '+(Math.random()*100|0), 'Demo'); });
			setCounts('st-followers','st-following','st-project-count');
			wireChat('st-chat-list','st-chat-input','st-chat-send');
			wireSideNavCollapse('st-nav-toggle','stu-side-nav');
		}
	});

	function populate(listId, n, factory){
		var container = document.getElementById(listId);
		if(!container) return;
		range(n).forEach(function(){ container.appendChild(factory()); });
	}

	function setCounts(followersId, followingId, projectsId){
		var followers = (50 + Math.random()*450) | 0;
		var following = (20 + Math.random()*280) | 0;
		var projects = (5 + Math.random()*20) | 0;
		var fEl = document.getElementById(followersId);
		var foEl = document.getElementById(followingId);
		var pEl = document.getElementById(projectsId);
		if(fEl) fEl.textContent = followers;
		if(foEl) foEl.textContent = following;
		if(pEl) pEl.textContent = projects;
	}

	function wireChat(listId, inputId, sendId){
		var list = document.getElementById(listId);
		var input = document.getElementById(inputId);
		var btn = document.getElementById(sendId);
		if(!list || !input || !btn) return;
		btn.addEventListener('click', function(){
			var text = (input.value||'').trim();
			if(!text) return;
			var bubble = el('div','box');
			bubble.textContent = text;
			bubble.style.marginBottom = '0.5rem';
			list.prepend(bubble);
			input.value = '';
		});
	}

	function wireSideNavCollapse(toggleId, navId){
		var toggle = document.getElementById(toggleId);
		var nav = document.getElementById(navId);
		if(!toggle || !nav) return;
		toggle.addEventListener('click', function(){
			nav.classList.toggle('collapsed');
		});
		
		// Handle navigation clicks
		var links = nav.querySelectorAll('a[href^="#"]');
		links.forEach(function(link){
			link.addEventListener('click', function(e){
				e.preventDefault();
				var targetId = this.getAttribute('href').substring(1);
				var target = document.getElementById(targetId);
				if(target){
					// Hide all content sections
					var allSections = document.querySelectorAll('.col-9 .box');
					allSections.forEach(function(section){
						section.style.display = 'none';
					});
					// Show target section
					target.style.display = 'block';
					
					// Update active state
					links.forEach(function(l){ l.classList.remove('active'); });
					this.classList.add('active');
				}
			});
		});
		
		// Show first section by default
		if(links.length > 0){
			links[0].click();
		}
	}
})();
