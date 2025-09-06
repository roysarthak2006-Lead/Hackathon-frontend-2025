/* ---------- Basic UI interactive behaviour + placeholders ---------- */

/* Helpers for DOM */
const byId = id => document.getElementById(id);
const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));

/* Elements */
const connectBtn = byId('connectBtn');
const disconnectBtn = byId('disconnectBtn');
const walletAddrEl = byId('walletAddr');
const ctaStart = byId('ctaStart');
const startQuestTop = byId('startQuestTop');
const modalRoot = byId('modalRoot');
const nftGallery = byId('nftGallery');
const badgeGallery = byId('badgeGallery');
const marketGrid = byId('marketGrid');
const leaderPreview = byId('leaderPreview');
const leaderboardList = byId('leaderboardList');
const statXP = byId('stat-xp');
const statTokens = byId('stat-tokens');
const statNFTs = byId('stat-nfts');
const claimRewardsBtn = byId('claimRewards');
const streakBar = byId('streakBar');
const xpBar = byId('xpBar');
const votingPower = byId('votingPower');

let state = {
  wallet: null,
  xp: 120,
  tokens: 45,
  nfts: 2,
  streakPercent: 30
};

/* Small demo data */
const demoMarket = [
  { id: 'g001', title: 'GreenProof #001', price: '0.02 ETH' },
  { id: 'g002', title: 'Reef Saver Badge', price: 'Mint' },
  { id: 'g003', title: 'Forest Guardian', price: '0.05 ETH' },
  { id: 'g004', title: 'Solar Hero', price: '0.01 ETH' }
];

const demoLeader = [
  { name:'Asha', xp: 1640 },
  { name:'Miguel', xp: 1022 },
  { name:'Zara', xp: 980 },
  { name:'You', xp: state.xp }
];

const demoProposals = [
  { id:1, title:'Plant 10k trees (India)', votes: 1240 },
  { id:2, title:'Ocean cleanup - coastal', votes: 870 }
];

/* ---------- Functions to render UI ---------- */
function renderStats(){
  statXP.textContent = state.xp;
  statTokens.textContent = state.tokens;
  statNFTs.textContent = state.nfts;
  streakBar.style.width = state.streakPercent + '%';
  xpBar.style.width = Math.min(100, state.xp / 20) + '%';
  votingPower.textContent = ((state.tokens/10).toFixed(1)) + ' GOV';
}

function renderGallery(){
  nftGallery.innerHTML = '';
  for(let i=0;i<state.nfts;i++){
    const div = document.createElement('div');
    div.className = 'nft-item';
    div.innerHTML = `<strong>Badge #${i+1}</strong><div class="muted">Minted</div>`;
    nftGallery.appendChild(div);
  }
  // badges
  badgeGallery.innerHTML = '';
  for(let i=0;i<6;i++){
    const b = document.createElement('div');
    b.className = 'badge';
    b.innerHTML = `<div style="text-align:center"><div style="font-size:24px">🏅</div><div style="font-size:12px;margin-top:6px;color:var(--muted)">Badge ${i+1}</div></div>`;
    badgeGallery.appendChild(b);
  }
}

function renderMarket(){
  marketGrid.innerHTML = '';
  demoMarket.forEach(it=>{
    const el = document.createElement('div');
    el.className = 'market-item';
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:700">${it.title}</div>
          <div style="color:var(--muted);font-size:13px">${it.price}</div>
        </div>
        <div>
          <button class="btn btn-sm" data-buy-id="${it.id}">${it.price === 'Mint' ? 'Mint' : 'Buy'}</button>
        </div>
      </div>
    `;
    marketGrid.appendChild(el);
  });
}

function renderLeader(){
  leaderPreview.innerHTML = '';
  leaderboardList.innerHTML = '';
  demoLeader.forEach((p, idx)=>{
    const li = document.createElement('li');
    li.textContent = `${p.name} — ${p.xp} XP`;
    leaderPreview.appendChild(li.cloneNode(true));
    const li2 = document.createElement('li');
    li2.textContent = `${idx+1}. ${p.name} — ${p.xp} XP`;
    leaderboardList.appendChild(li2);
  });
}

function renderProposals(){
  const proposalsEl = document.getElementById('proposals');
  proposalsEl.innerHTML = '';
  demoProposals.forEach(p=>{
    const div = document.createElement('div');
    div.style.borderTop = '1px solid rgba(255,255,255,0.02)';
    div.style.padding = '10px 0';
    div.innerHTML = `<strong>${p.title}</strong><div style="color:var(--muted);font-size:13px">Votes: ${p.votes}</div>
      <div style="margin-top:8px"><button class="btn btn-sm" data-voteid="${p.id}">Vote</button></div>`;
    proposalsEl.appendChild(div);
  });
}

/* ---------- Wallet connect (light integration) ---------- */
async function tryConnectWallet(){
  if(window.ethereum){
    try{
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      state.wallet = accounts[0];
      walletAddrEl.textContent = shorten(state.wallet);
      connectBtn.textContent = 'Connected';
      connectBtn.classList.remove('btn-outline');
      connectBtn.classList.add('btn-primary');
      renderStats();
      return true;
    }catch(err){
      alert('Connection rejected or failed.');
      console.error(err);
      return false;
    }
  }else{
    showModal('No Web3 Provider', `<p>MetaMask or another Web3 wallet was not detected in your browser. For demo you can continue as guest, or install MetaMask.</p><div class="modal-actions"><a class="btn btn-primary" href="https://metamask.io" target="_blank">Install MetaMask</a><button class="btn btn-outline" id="modalClose">Close</button></div>`);
    return false;
  }
}
function shorten(addr){
  if(!addr) return 'Not connected';
  return addr.slice(0,6) + '...' + addr.slice(-4);
}
connectBtn.addEventListener('click', ()=>tryConnectWallet());

disconnectBtn.addEventListener('click', ()=>{
  state.wallet = null;
  walletAddrEl.textContent = 'Not connected';
  connectBtn.textContent = 'Connect Wallet';
  connectBtn.classList.remove('btn-primary');
  connectBtn.classList.add('btn-outline');
});

/* ---------- Modal helpers ---------- */
function showModal(titleHtml, bodyHtml){
  modalRoot.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><h3>${titleHtml}</h3><div>${bodyHtml}</div></div>`;
  modalRoot.style.pointerEvents = 'auto';
  modalRoot.setAttribute('aria-hidden', 'false');

  // close handler
  const closeBtn = document.getElementById('modalClose');
  if(closeBtn) closeBtn.addEventListener('click', closeModal);
}
function closeModal(){ modalRoot.innerHTML=''; modalRoot.style.pointerEvents='none'; modalRoot.setAttribute('aria-hidden','true') }

/* ---------- Event flows (Join quest, Upload proof, Mint, Buy) ---------- */
qsa('[data-join]').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    const q = e.currentTarget.getAttribute('data-quest');
    showModal('Join Quest', `<p>You joined <strong>${q}</strong>. Upload proof to complete it and mint your badge.</p><div class="modal-actions"><button class="btn btn-primary" id="modalJoinConfirm">Got it</button><button class="btn btn-outline" id="modalClose">Close</button></div>`);
    document.getElementById('modalJoinConfirm').addEventListener('click', closeModal);
  });
});

qsa('[data-upload]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    // Upload modal simulating proof -> then mint
    showModal('Upload Proof', `
      <p>Upload a photo or QR as proof of action.</p>
      <input type="file" id="proofFile" accept="image/*" />
      <div class="modal-actions">
        <button class="btn btn-primary" id="doUpload">Upload & Verify</button>
        <button class="btn btn-outline" id="modalClose">Cancel</button>
      </div>
    `);
    document.getElementById('doUpload').addEventListener('click', ()=>{
      // simulate verification success
      closeModal();
      setTimeout(()=> showModal('Verified!', `<p>Proof verified. Mint your NFT badge?</p><div class="modal-actions"><button class="btn btn-primary" id="doMint">Mint NFT</button><button class="btn btn-outline" id="modalClose">Later</button></div>`),250);
      setTimeout(()=> {
        const d = document.getElementById('doMint');
        if(d) d.addEventListener('click', doMint);
      },300);
    });
  });
});

function doMint(){
  // Placeholder: here you'd call your backend or Verbwire API to mint
  closeModal();
  showModal('Minting NFT', '<p>Your badge NFT is being minted (demo). This will simulate a blockchain transaction.</p><div class="modal-actions"><button class="btn btn-primary" id="mintOk">OK</button></div>');
  document.getElementById('mintOk').addEventListener('click', ()=>{
    closeModal();
    // update demo state
    state.nfts += 1;
    state.xp += 40;
    state.tokens += 5;
    state.streakPercent = Math.min(100, state.streakPercent + 5);
    renderStats();
    renderGallery();
    renderLeader();
    showToast('NFT minted successfully! 🎉');
  });
}

/* Buy / Mint buttons in hero/market */
document.body.addEventListener('click', (ev)=>{
  const buy = ev.target.closest('[data-buy-id]');
  if(buy){
    const id = buy.getAttribute('data-buy-id');
    showModal('Buy NFT', `<p>Buy ${id} — this would open the marketplace flow via Verbwire / smart-contract in a real app.</p><div class="modal-actions"><button class="btn btn-primary" id="confirmBuy">Confirm Buy</button><button class="btn btn-outline" id="modalClose">Cancel</button></div>`);
    document.getElementById('confirmBuy').addEventListener('click', ()=>{
      closeModal();
      state.tokens = Math.max(0, state.tokens - 3);
      state.xp += 10;
      renderStats();
      showToast('Purchase successful (demo).');
    });
  }
});

/* Claim rewards (simulated Contract call) */
claimRewardsBtn && claimRewardsBtn.addEventListener('click', ()=>{
  // placeholder for BlockDAG-backed tx
  if(!state.wallet){
    showModal('Wallet Required', '<p>Please connect wallet to claim rewards.</p><div class="modal-actions"><button class="btn btn-primary" id="modalConnectNow">Connect</button><button class="btn btn-outline" id="modalClose">Close</button></div>');
    document.getElementById('modalConnectNow').addEventListener('click', ()=>{tryConnectWallet(); closeModal();});
    return;
  }
  showModal('Claim Rewards', `<p>Claiming ${state.tokens} tokens to ${shorten(state.wallet)} via fast tx (simulated).</p><div class="modal-actions"><button class="btn btn-primary" id="confirmClaim">Claim</button><button class="btn btn-outline" id="modalClose">Cancel</button></div>`);
  document.getElementById('confirmClaim').addEventListener('click', ()=>{
    closeModal();
    showToast('Rewards sent! (simulated BlockDAG tx)');
    state.tokens = 0;
    renderStats();
  });
});

/* DAO vote & create */
document.body.addEventListener('click', (ev)=>{
  const vote = ev.target.closest('[data-voteid]');
  if(vote){
    const id = vote.getAttribute('data-voteid');
    showModal('Vote', `<p>Cast your vote on proposal ${id}.</p><div class="modal-actions"><button class="btn btn-primary" id="confirmVote">Vote Yes</button><button class="btn btn-outline" id="modalClose">No</button></div>`);
    document.getElementById('confirmVote').addEventListener('click', ()=>{
      closeModal();
      showToast('Vote recorded (simulated).');
    });
  }
});

/* Join seasonal */
byId('joinSeason').addEventListener('click', ()=>{
  showModal('Seasonal Challenge', '<p>You joined the seasonal challenge! Top players win a rare NFT.</p><div class="modal-actions"><button class="btn btn-primary" id="seasonOk">OK</button></div>');
  document.getElementById('seasonOk').addEventListener('click', closeModal);
});

/* small toast */
function showToast(text){
  const t = document.createElement('div');
  t.textContent = text;
  t.style.position = 'fixed';
  t.style.right='18px';t.style.bottom='18px';t.style.background='rgba(3,6,12,0.9)';t.style.padding='10px 14px';t.style.borderRadius='10px';t.style.border='1px solid rgba(74,222,128,0.06)';t.style.zIndex=9999;
  document.body.appendChild(t);
  setTimeout(()=>t.style.transform='translateY(-8px)',20);
  setTimeout(()=>t.remove(),3000);
}

/* Navigation smooth scroll */
qsa('[data-link]').forEach(a=>{
  a.addEventListener('click', e=>{
    e.preventDefault();
    const href = a.getAttribute('href');
    document.querySelector(href).scrollIntoView({behavior:'smooth', block:'start'});
  });
});

/* CTA actions */
ctaStart.addEventListener('click', ()=> document.querySelector('#quests').scrollIntoView({behavior:'smooth'}));
startQuestTop.addEventListener('click', ()=> document.querySelector('#dashboard').scrollIntoView({behavior:'smooth'}));

/* initial render */
renderStats();
renderGallery();
renderMarket();
renderLeader();
renderProposals();

/* ---------- Nice background particles canvas ---------- */
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
function resizeCanvas(){ canvas.width = innerWidth; canvas.height = innerHeight; }
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let particles = [];
function initParticles(){
  particles = [];
  const count = Math.floor(innerWidth / 12);
  for(let i=0;i<count;i++){
    particles.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      r: 0.6 + Math.random()*2,
      dx: (Math.random()-0.5)*0.3,
      dy: (Math.random()-0.5)*0.3,
      hue: 140 + Math.random()*80
    });
  }
}
initParticles();

function loop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // subtle gradient
  const g = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
  g.addColorStop(0, 'rgba(3,6,12,0.0)');
  g.addColorStop(1, 'rgba(3,6,12,0.2)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  for(let p of particles){
    p.x += p.dx;
    p.y += p.dy;
    if(p.x < -10) p.x = canvas.width + 10;
    if(p.x > canvas.width + 10) p.x = -10;
    if(p.y < -10) p.y = canvas.height + 10;
    if(p.y > canvas.height + 10) p.y = -10;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, 0.08)`;
    ctx.fill();
  }

  requestAnimationFrame(loop);
}
loop();

/* ---------- small UX: close modal on background click ---------- */
modalRoot.addEventListener('click', (e)=>{
  if(e.target === modalRoot) closeModal();
});

/* ---------- Accessibility helpers ---------- */
/* Focus outline when keyboard used */
window.addEventListener('keydown', (e)=>{
  if(e.key === 'Tab') document.body.classList.add('show-focus');
});

/* ---------- END ---------- */
