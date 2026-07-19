document.getElementById('yr').textContent=new Date().getFullYear();
var burger=document.getElementById('burger'),links=document.getElementById('links');
burger.addEventListener('click',function(){links.classList.toggle('open')});
links.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){links.classList.remove('open')})});

var progress=document.getElementById('progress');
function onScroll(){var st=window.scrollY,h=document.documentElement.scrollHeight-window.innerHeight;progress.style.width=(h>0?(st/h*100):0)+'%';}
window.addEventListener('scroll',onScroll,{passive:true});onScroll();

var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});
document.querySelectorAll('.job').forEach(function(el){new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle('is-in',e.isIntersecting)})},{threshold:.4}).observe(el)});

var navMap={};
document.querySelectorAll('.nav-links a').forEach(function(a){var id=a.getAttribute('href').slice(1);if(id)navMap[id]=a});
var secObs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var id=e.target.id;Object.keys(navMap).forEach(function(k){navMap[k].classList.remove('active')});if(navMap[id])navMap[id].classList.add('active')}})},{threshold:.4});
['about','experience','skills','work','contact'].forEach(function(id){var s=document.getElementById(id);if(s)secObs.observe(s)});