(function(){
	function el(tag, cls){ var e = document.createElement(tag); if(cls) e.className = cls; return e; }
	function card(title, meta){ var b = el('div','box'); b.innerHTML = '<strong>'+title+'</strong><br/><span>'+meta+'</span>'; return b; }
	function range(n){ return Array.from({length:n}, (_,i)=>i); }
	function sample(list){ return list[Math.floor(Math.random()*list.length)]; }

	var alumniNames = ['Aarav Mehta','Isha Kapoor','Rohan Gupta','Meera Nair','Dev Patel','Ananya Rao'];
	var studentNames = ['Nikhil Sharma','Priya Singh','Karan Das','Sneha Roy','Arjun Iyer','Ritu Jain'];
	var roles = ['Software Engineer','Data Scientist','Product Manager','Hardware Engineer','Web Developer'];
	var depts = ['CSE','ECE','ME','IT','AI/ML'];
	var locations = ['Bengaluru','Delhi','Mumbai','Pune','Hyderabad'];

	function getUserRole(){
		try{ var step = sessionStorage.getItem('signupStep1'); if(step){ var s = JSON.parse(step); return s.userType||''; } }catch(e){}
		return '';
	}

	document.addEventListener('DOMContentLoaded', function(){
		// New topbar/side-rail wiring
		var side = document.getElementById('side-rail');
		var toggleBtn = document.getElementById('global-hamburger');
		var content = document.querySelector('.with-side-rail');
		if(toggleBtn && side && content){
			toggleBtn.addEventListener('click', function(){
				side.classList.toggle('collapsed');
				content.classList.toggle('collapsed');
			});
		}

		// Highlight active item
		var nav = document.getElementById('common-side-nav');
		if(nav){
			var here = window.location.pathname.split('/').pop();
			Array.prototype.forEach.call(nav.querySelectorAll('a'), function(a){
				var href = a.getAttribute('href');
				if(href && href === here){ a.classList.add('active'); }
			});
		}

		// Profile link should go to role-specific profile
		var profileLink = document.getElementById('profile-link');
		if(profileLink){
			var role = getUserRole();
			profileLink.setAttribute('href', role === 'alumni' ? 'alumni-profile.html' : 'student-profile.html');
		}

		// Chat functionality
		initChat();

		// Alumni list
		var alumniCards = document.getElementById('alumni-cards');
		if(alumniCards){ range(12).forEach(function(){ alumniCards.appendChild(card(sample(alumniNames), sample(roles)+' · '+sample(locations))); }); }

		// Student list
		var studentCards = document.getElementById('student-cards');
		if(studentCards){ range(12).forEach(function(){ studentCards.appendChild(card(sample(studentNames), sample(depts)+' · '+sample(locations))); }); }

		// Projects
		var projectCards = document.getElementById('project-cards');
		var projectPost = document.getElementById('project-post');
		if(projectCards){ range(8).forEach(function(){ projectCards.appendChild(card('Project '+(Math.random()*100|0), 'By '+sample(alumniNames.concat(studentNames)))); }); }
		if(projectPost){ projectPost.addEventListener('click', function(){
			var title = (document.getElementById('project-title').value||'').trim();
			if(!title) return;
			projectCards.prepend(card(title, 'By You'));
			document.getElementById('project-form').reset();
		}); }

		// Profiles (alumni/student)
		try{
			var step = sessionStorage.getItem('signupStep1');
			if(step){
				var s = JSON.parse(step);
				if(document.getElementById('ap-name')){
					document.getElementById('ap-name').textContent = s.fullName || '-';
					document.getElementById('ap-role').textContent = s.currentRole || '-';
					document.getElementById('ap-college').textContent = s.collegeName || '-';
					document.getElementById('ap-location').textContent = sample(locations);
					setCounts('ap-followers','ap-following','ap-projects');
					populate('ap-project-list', 6);
				}
				if(document.getElementById('sp-name')){
					document.getElementById('sp-name').textContent = s.fullName || '-';
					document.getElementById('sp-dept').textContent = s.department || '-';
					document.getElementById('sp-college').textContent = s.collegeName || '-';
					document.getElementById('sp-location').textContent = sample(locations);
					setCounts('sp-followers','sp-following','sp-projects');
					populate('sp-project-list', 6);
				}
			}
		}catch(e){}
	});

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

	function populate(containerId, n){
		var elc = document.getElementById(containerId); if(!elc) return;
		for(var i=0;i<n;i++){ elc.appendChild(card('Project '+(Math.random()*100|0),'Demo')); }
	}

	function initChat(){
		var messagesList = document.getElementById('messages-list');
		var messageFilter = document.getElementById('message-filter');
		var filterDropdown = document.getElementById('filter-dropdown');
		var noChatSelected = document.getElementById('no-chat-selected');
		var activeChat = document.getElementById('active-chat');
		var chatInput = document.getElementById('chat-input');
		var sendMessage = document.getElementById('send-message');
		var chatMessages = document.getElementById('chat-messages');
		var chatUserName = document.getElementById('chat-user-name');
		var searchInput = document.querySelector('.search-input');
		

		// Sample alumni data for messages
		var alumniMessages = [
			{name: 'Aarav Mehta', preview: 'Hey, how are you doing?', time: '2m ago', unread: true, status: 'Online', starred: true, role: 'Software Engineer', location: 'Bengaluru, India', description: 'Passionate about technology and innovation. Always eager to help fellow alumni and students.', followers: 245, following: 89, posts: 12},
			{name: 'Isha Kapoor', preview: 'Thanks for the project update', time: '1h ago', unread: false, status: 'Offline', starred: false, role: 'Data Scientist', location: 'Mumbai, India', description: 'Data enthusiast with expertise in machine learning and analytics. Love mentoring students.', followers: 189, following: 67, posts: 8},
			{name: 'Rohan Gupta', preview: 'Can we schedule a meeting?', time: '3h ago', unread: true, status: 'Online', starred: true, role: 'Product Manager', location: 'Delhi, India', description: 'Product strategist with a passion for user experience and business growth.', followers: 312, following: 124, posts: 15},
			{name: 'Meera Nair', preview: 'Great work on the presentation!', time: '1d ago', unread: false, status: 'Offline', starred: false, role: 'Web Developer', location: 'Pune, India', description: 'Full-stack developer with expertise in modern web technologies.', followers: 156, following: 45, posts: 6},
			{name: 'Dev Patel', preview: 'Let me know about the internship', time: '2d ago', unread: false, status: 'Online', starred: true, role: 'Hardware Engineer', location: 'Hyderabad, India', description: 'Hardware specialist focused on IoT and embedded systems development.', followers: 98, following: 23, posts: 4},
			{name: 'Ananya Rao', preview: 'The code review looks good', time: '3d ago', unread: false, status: 'Offline', starred: false, role: 'Mobile Developer', location: 'Chennai, India', description: 'Mobile app developer with expertise in iOS and Android platforms.', followers: 203, following: 78, posts: 9}
		];

		var currentChat = null;
		var filteredMessages = [...alumniMessages];
		var currentFilter = 'all';
		var originalIndices = []; // Track original indices of filtered messages

		// Render messages list
		function renderMessages(){
			if(!messagesList) return;
			messagesList.innerHTML = '';
			
			if(filteredMessages.length === 0){
				messagesList.innerHTML = '<div style="padding: 2rem; text-align: center; color: #666;">No messages found</div>';
				return;
			}

			filteredMessages.forEach(function(msg, index){
				var messageItem = el('div', 'message-item');
				if(currentChat === index) messageItem.classList.add('active');
				if(msg.unread) messageItem.classList.add('message-unread');

				messageItem.innerHTML = `
					<div class="message-avatar">${msg.name.charAt(0)}</div>
					<div class="message-content">
						<div class="message-name clickable-name" data-index="${index}">${msg.name}</div>
						<div class="message-preview">${msg.preview}</div>
						<div class="message-time">${msg.time}</div>
					</div>
				`;

				messageItem.addEventListener('click', function(e){
					// Don't trigger chat selection if clicking on name
					if(!e.target.classList.contains('clickable-name')){
						selectChat(index);
					}
				});

				// Add click handler for name
				var nameElement = messageItem.querySelector('.clickable-name');
				if(nameElement){
					nameElement.addEventListener('click', function(e){
						e.stopPropagation();
						showProfileModal(index);
					});
				}

				messagesList.appendChild(messageItem);
			});
		}

		// Select a chat
		function selectChat(index){
			if(index >= 0 && index < filteredMessages.length){
				currentChat = index;
				var msg = filteredMessages[index];
				var originalIndex = originalIndices[index];
				
				// Update UI
				if(noChatSelected) noChatSelected.style.display = 'none';
				if(activeChat) activeChat.style.display = 'flex';
				
				// Update chat header
				if(chatUserName) chatUserName.textContent = msg.name;
				
				// Mark as read in original array
				if(originalIndex >= 0 && originalIndex < alumniMessages.length){
					alumniMessages[originalIndex].unread = false;
				}
				
				// Re-render messages list
				renderMessages();
				
				// Clear and focus input
				if(chatInput) {
					chatInput.value = '';
					chatInput.focus();
				}
			}
		}

		// Filter messages
		function filterMessages(){
			var search = searchInput ? searchInput.value.toLowerCase() : '';
			
			filteredMessages = [];
			originalIndices = [];
			
			alumniMessages.forEach(function(msg, originalIndex){
				var matchesFilter = true;
				if(currentFilter === 'unread') matchesFilter = msg.unread;
				else if(currentFilter === 'read') matchesFilter = !msg.unread;
				else if(currentFilter === 'starred') matchesFilter = msg.starred || false;
				else if(currentFilter === 'active') matchesFilter = msg.status === 'Online';
				
				var matchesSearch = true;
				if(search) matchesSearch = msg.name.toLowerCase().includes(search) || msg.preview.toLowerCase().includes(search);
				
				if(matchesFilter && matchesSearch){
					filteredMessages.push(msg);
					originalIndices.push(originalIndex);
				}
			});
			
			renderMessages();
		}

		// Toggle filter dropdown
		function toggleFilterDropdown(){
			if(filterDropdown) {
				var isVisible = filterDropdown.style.display === 'block';
				filterDropdown.style.display = isVisible ? 'none' : 'block';
			}
		}

		// Set filter
		function setFilter(filterValue){
			currentFilter = filterValue;
			messageFilter.classList.toggle('active', filterValue !== 'all');
			filterDropdown.style.display = 'none';
			
			// Update active state in dropdown
			var options = filterDropdown.querySelectorAll('.filter-option');
			options.forEach(function(option){
				option.classList.toggle('active', option.dataset.value === filterValue);
			});
			
			filterMessages();
		}

		// Send message
		function sendChatMessage(){
			if(!chatInput || !sendMessage) return;
			
			var text = chatInput.value.trim();
			if(!text) return;
			
			// Add message to chat area
			if(chatMessages){
				var messageDiv = el('div', 'message-bubble');
				messageDiv.innerHTML = `
					<div style="background: #007bff; color: white; padding: 0.5rem 1rem; border-radius: 18px; margin: 0.5rem 0; margin-left: auto; max-width: 70%; word-wrap: break-word;">
						${text}
					</div>
				`;
				chatMessages.appendChild(messageDiv);
				chatMessages.scrollTop = chatMessages.scrollHeight;
			}
			
			chatInput.value = '';
		}

		// Show profile modal
		function showProfileModal(index){
			var profileModal = document.getElementById('profile-modal');
			if(index >= 0 && index < filteredMessages.length){
				var msg = filteredMessages[index];
				
				if(!profileModal || !msg) return;
				
				// Update profile data
				var nameEl = document.getElementById('profile-name');
				var roleEl = document.getElementById('profile-role');
				var locationEl = document.getElementById('profile-location');
				var descriptionEl = document.getElementById('profile-description');
				var followersEl = document.getElementById('profile-followers');
				var followingEl = document.getElementById('profile-following');
				var postsEl = document.getElementById('profile-posts');
				
				if(nameEl) nameEl.textContent = msg.name;
				if(roleEl) roleEl.textContent = msg.role;
				if(locationEl) locationEl.textContent = msg.location;
				if(descriptionEl) descriptionEl.textContent = msg.description;
				if(followersEl) followersEl.textContent = msg.followers;
				if(followingEl) followingEl.textContent = msg.following;
				if(postsEl) postsEl.textContent = msg.posts;
				
				// Update avatar
				var avatarInitial = document.getElementById('profile-avatar-initial');
				if(avatarInitial) avatarInitial.textContent = msg.name.charAt(0);
				
				// Generate sample projects
				generateProfileProjects(msg.name);
				
				// Show modal
				profileModal.style.display = 'flex';
			}
		}

		// Generate sample projects for profile
		function generateProfileProjects(name){
			var projectsList = document.getElementById('profile-projects-list');
			if(!projectsList) return;
			
			var projectTitles = [
				'AI Chatbot Development',
				'Mobile App for E-commerce',
				'Data Analytics Dashboard',
				'Web Scraping Tool',
				'Machine Learning Model',
				'Cloud Migration Project',
				'API Integration System',
				'Database Optimization'
			];
			
			var projectDescriptions = [
				'Built an intelligent chatbot using NLP',
				'Developed cross-platform mobile application',
				'Created interactive data visualization',
				'Automated data collection process',
				'Trained ML model for prediction',
				'Migrated legacy systems to cloud',
				'Integrated multiple third-party APIs',
				'Optimized database performance'
			];
			
			projectsList.innerHTML = '';
			
			// Show 4-6 random projects
			var numProjects = 4 + Math.floor(Math.random() * 3);
			for(var i = 0; i < numProjects; i++){
				var projectCard = el('div', 'project-card');
				var title = projectTitles[Math.floor(Math.random() * projectTitles.length)];
				var description = projectDescriptions[Math.floor(Math.random() * projectDescriptions.length)];
				
				projectCard.innerHTML = `
					<h4>${title}</h4>
					<p>${description}</p>
				`;
				
				projectsList.appendChild(projectCard);
			}
		}

		// Close profile modal
		function closeProfileModal(){
			var profileModal = document.getElementById('profile-modal');
			if(profileModal) profileModal.style.display = 'none';
		}

		// Event listeners
		if(messageFilter) {
			messageFilter.addEventListener('click', function(e){
				e.preventDefault();
				e.stopPropagation();
				toggleFilterDropdown();
			});
		}
		if(searchInput) searchInput.addEventListener('input', filterMessages);
		if(sendMessage) sendMessage.addEventListener('click', sendChatMessage);
		if(chatInput) {
			chatInput.addEventListener('keypress', function(e){
				if(e.key === 'Enter') sendChatMessage();
			});
		}

		// Send message button in no-chat-selected area
		var sendMessageBtn = document.querySelector('.no-chat-selected .button');
		if(sendMessageBtn) {
			sendMessageBtn.addEventListener('click', function(){
				// This could open a new chat dialog or redirect to a contact list
				console.log('Send message button clicked - could open new chat dialog');
			});
		}

		// Filter dropdown event listeners
		if(filterDropdown) {
			var filterOptions = filterDropdown.querySelectorAll('.filter-option');
			filterOptions.forEach(function(option){
				option.addEventListener('click', function(){
					setFilter(this.dataset.value);
				});
			});
		}

		// Close dropdown when clicking outside
		document.addEventListener('click', function(e){
			if(filterDropdown && !filterDropdown.contains(e.target) && !messageFilter.contains(e.target)){
				filterDropdown.style.display = 'none';
			}
		});

		// Profile modal event listeners
		var closeBtn = document.getElementById('close-profile-modal');
		var profileModal = document.getElementById('profile-modal');
		if(closeBtn) closeBtn.addEventListener('click', closeProfileModal);
		if(profileModal) {
			profileModal.addEventListener('click', function(e){
				if(e.target === profileModal) closeProfileModal();
			});
		}

		// Initial render
		renderMessages();
		
		// Initialize filter state
		if(filterDropdown) {
			var allOption = filterDropdown.querySelector('[data-value="all"]');
			if(allOption) allOption.classList.add('active');
		}
		
	}
})();
