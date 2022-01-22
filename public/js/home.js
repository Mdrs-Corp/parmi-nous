const create = () => {
    const name = document.querySelector('#name');
    window.location.replace(`/game?name=${name.value}`);
}

const join = () => {
    const name = document.querySelector('#name');
    const id = document.querySelector('#id');
    window.location.replace(`/game?name=${name.value}&id=${id.value}`);
}

document.querySelector('#id').addEventListener('keydown', e => {
    if (e.key === 'Enter')
        join();
})



// ptite animation de amogus là 😋
const sus = document.querySelector('#sus');

const knife = document.querySelector('#knife');
const tracker = document.querySelector('#tracker');
let animK, animT;

const move = (w, h) => {
    const nw = Math.floor(Math.random() * 200) + 400;
    const nh = Math.floor(Math.random() * 200) + 400;

    const keyframes = [{ width: `${w}px`, height: `${h}px` },
        { width: `${nw}px`, height: `${nh}px` }];
    const duration = 40 * Math.sqrt((w - nw)**2 + (h - nh)**2);

    sus.animate(keyframes, { duration: duration, easing: 'ease-in-out' })
        .onfinish = () => { move(nw, nh) };
}

const kill = () => {
    document.body.style.cursor = 'default';

    knife.remove();
    tracker.remove();

    document.querySelector('#sus > img').src = '/images/dead.png';
    document.removeEventListener('click', drop);
    sus.removeEventListener('click', kill);
}

const moveK = (x, y, r) => {
    const nx = Math.random() * 90 + 5;
    const ny = Math.random() * 90 + 5;
    const nr = Math.random() * 360 * (Math.random() < .5 ? -1 : 1);

    const keyframes = [{ left: `${x}vw`, top: `${y}vh`, transform: `rotate(${r}deg)` },
        { left: `${nx}vw`, top: `${ny}vh`, transform: `rotate(${nr}deg)` }];
    const duration = 8 * Math.sqrt(window.innerWidth * (x - nx)**2 + window.innerHeight * (y - nx)**2);

    animK = knife.animate(keyframes, {duration: duration, easing: 'ease-in-out', fill: 'forwards'});
    animT = tracker.animate(keyframes, {duration: duration, easing: 'ease-in-out', fill: 'forwards'});
    animT.onfinish = () => moveK(nx, ny, nr);
}

const drop = e => {
    if (e.target.id == 'sus-img' || e.target.id == 'tracker') return;
    
    document.body.style.cursor = 'default';
        
    document.body.appendChild(knife);
    document.body.appendChild(tracker);

    const x = e.clientX - 30;
    knife.style.left = `${x}px`;
    tracker.style.left = `${x}px`;

    const y = e.clientY - 23;
    knife.style.top = `${y}px`;
    tracker.style.top = `${y}px`;

    moveK(100 * x/window.innerWidth, 100 * y/window.innerHeight, 0);

    document.removeEventListener('click', drop);
    sus.removeEventListener('click', kill);
}

tracker.addEventListener('click', () => {
    animK.cancel();
    animT.cancel();    
    knife.remove();
    tracker.remove();

    document.body.style.cursor = 'url(/images/knife.png) 30 23, auto';

    document.addEventListener('click', drop);
    sus.addEventListener('click', kill);
})

move(Math.floor(Math.random() * 200) + 400, Math.floor(Math.random() * 200) + 400);
moveK(Math.random() * 90 + 5, Math.random() * 90 + 5, 0);