import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createState, isRevealed, projectBattle, projectFeed, disputes, pendingMyTurn,
  chooseType, chooseColor, rotatePhrase, saveText, commit, restoreSyntheticState,
  initialExpandedId, TYPES
} from './chat04_4_battle_cards.mjs';

const snap = (state,id='бой-101',viewer=state.viewer)=>projectBattle(state.battles.find(b=>b.id===id),viewer);
const json = x => JSON.stringify(x);

test('separate stable synthetic battle IDs',()=>{
 const s=createState();assert.deepEqual(s.battles.map(x=>x.id),['бой-101','бой-102','бой-103']);
 assert.equal(new Set(s.battles.map(x=>x.id)).size,3);
});
test('first unresolved card expanded by default',()=>{const s=createState();assert.equal(s.expandedId,initialExpandedId(s));});
test('phase and my-turn count ignore already-confirmed mock moves',()=>{
 const s=createState();assert.equal(pendingMyTurn(s),1);s.viewer='B';assert.equal(pendingMyTurn(s),2);
 s.viewer='spectator';assert.equal(pendingMyTurn(s),0);
});
test('viewer A projection cannot contain opponent pre-reveal tactics, colors, texts or result',()=>{
 const s=createState(),a=snap(s,'бой-101','A'),privateB=s.battles[0].sides.B;
 assert.equal(a.mine,'A');assert.ok(a.sides.A.attack.text);assert.equal(a.sides.B,undefined);
 assert.equal(a.result,undefined);assert.equal(json(a).includes(privateB.attack.text),false);
 assert.equal(json(a).includes(privateB.defense.text),false);
 assert.equal(json(a).includes('mechanicalOutcome'),false);
});
test('viewer B projection cannot contain A choices pre-reveal',()=>{
 const s=createState(),b=snap(s,'бой-101','B');assert.equal(b.mine,'B');assert.equal(b.sides.A,undefined);
 assert.equal(json(b).includes(s.battles[0].sides.A.attack.text),false);
});
test('spectator public projection omits names, hidden tactics, colors, context, commits and result',()=>{
 const s=createState(),p=snap(s,'бой-101','spectator');
 assert.deepEqual(Object.keys(p).sort(),['battleId','date','mine','phase','publicStatus','revealed'].sort());
 const text=json(p);
 for(const word of ['Настя','Жёлтый','Оранжевый','Красный','Ты слишком','Есть вопрос','mechanicalOutcome','committed','context','sides'])assert.equal(text.includes(word),false,word);
});
test('unknown viewer is treated as public read-only pre-reveal',()=>{
 const s=createState(); assert.deepEqual(snap(s,'бой-101','evil'),snap(s,'бой-101','spectator'));
});
test('no pre-reveal result or opponent choice even if opponent is already committed',()=>{
 const s=createState();const p=snap(s,'бой-102','B');assert.equal(p.committed.A,true);
 assert.equal(p.sides.A,undefined);assert.equal(p.result,undefined);
});
test('attack and defense have independent type/color choices',()=>{
 const s=createState();assert.equal(chooseType(s,'бой-101','attack','T'),true);
 assert.equal(chooseColor(s,'бой-101','defense','r'),true);
 assert.equal(s.battles[0].sides.A.attack.type,'T');assert.equal(s.battles[0].sides.A.defense.type,'S');
 assert.equal(s.battles[0].sides.A.attack.color,'o');assert.equal(s.battles[0].sides.A.defense.color,'r');
});
test('rotate returns prescribed ready phrase, no authored text left behind',()=>{
 const s=createState(),before=s.battles[0].sides.A.attack.text;
 assert.equal(saveText(s,'бой-101','attack','Мой новый текст'),true);
 assert.equal(rotatePhrase(s,'бой-101','attack'),true);
 assert.notEqual(s.battles[0].sides.A.attack.text,before);
 assert.notEqual(s.battles[0].sides.A.attack.text,'Мой новый текст');
 assert.equal(rotatePhrase(s,'бой-101','attack'),true);assert.equal(s.battles[0].sides.A.attack.text,before);
});
test('type change refreshes selected ready phrase',()=>{
 const s=createState();saveText(s,'бой-101','attack','Свой текст');
 assert.ok(chooseType(s,'бой-101','attack','N'));assert.equal(s.battles[0].sides.A.attack.text,TYPES.attack[0].phrases[0]);
});
test('empty or invalid authored text keeps prior draft untouched',()=>{
 const s=createState(),old=s.battles[0].sides.A.attack.text;
 for(const v of ['', '   ', '\n', 'x'.repeat(281),null])assert.equal(saveText(s,'бой-101','attack',v),false);
 assert.equal(s.battles[0].sides.A.attack.text,old);
});
test('reject unauthorized type, color and rival-side mutation',()=>{
 const s=createState();assert.equal(chooseType(s,'бой-101','attack','X'),false);
 assert.equal(chooseColor(s,'бой-101','attack','k'),false);
 assert.equal(chooseType(s,'бой-101','result','N'),false);
 assert.equal(commit(s,'not-existing'),false);
 s.viewer='spectator';assert.equal(saveText(s,'бой-101','attack','leak'),false);
 assert.equal(commit(s,'бой-101'),false);
});
test('cannot repeat action on committed side; second commit reveals instantaneously',()=>{
 const s=createState();assert.equal(commit(s,'бой-101'),true);
 assert.equal(commit(s,'бой-101'),false);
 assert.equal(saveText(s,'бой-101','attack','После коммита'),false);
 assert.equal(isRevealed(s.battles[0]),false);
 s.viewer='B';assert.equal(commit(s,'бой-101'),true);
 const p=snap(s,'бой-101','spectator');assert.equal(p.revealed,true);assert.ok(p.sides.A.attack.text);assert.ok(p.sides.A.defense.text);
 assert.ok(p.sides.B.attack.text);assert.ok(p.sides.B.defense.text);assert.equal(p.result.mechanicalOutcome,'B_WIN');
});
test('revealed cards contain all four and official synthetic mechanical result, not social result',()=>{
 const s=createState();const p=snap(s,'бой-103','spectator');
 assert.equal(p.phase,'revealed');assert.ok(p.result.explanation);assert.equal(p.result.socialOutcome,undefined);
 assert.equal(p.result.recognizedOutcome,undefined);assert.equal(p.context,undefined);
});
test('no editing or re-commit once revealed',()=>{
 const s=createState();assert.equal(saveText(s,'бой-103','attack','change'),false);
 assert.equal(rotatePhrase(s,'бой-103','attack'),false);assert.equal(commit(s,'бой-103'),false);
});
test('same battle IDs feed and disputes, not duplicated entity copies',()=>{
 const s=createState();assert.deepEqual(disputes(s),projectFeed(s));
 assert.deepEqual(projectFeed(s).map(x=>x.battleId),['бой-101','бой-102','бой-103']);
});
test('restore preserves synthetic drafts, commits, current viewer and collapsed card state',()=>{
 const s=createState();saveText(s,'бой-101','attack','Не теряй мои слова');s.viewer='B';s.view='disputes';s.expandedId=null;
 const restored=restoreSyntheticState(JSON.parse(JSON.stringify(s)));
 assert.equal(restored.battles[0].sides.A.attack.text,'Не теряй мои слова');
 assert.equal(restored.viewer,'B');assert.equal(restored.view,'disputes');assert.equal(restored.expandedId,null);
 assert.equal(restored.battles[1].sides.A.committed,true);
});
test('corrupted and attacker-shaped persisted synthetic fixtures do not inject unknown battles or arbitrary fields',()=>{
 const s=restoreSyntheticState({battles:[{id:'бой-101',sides:{A:{committed:true,attack:{type:'evil',color:'k',text:'',other:'x'},defense:{text:'x'.repeat(400)}},B:{}}},{id:'secret-battle',sides:{}}],viewer:'intruder',view:'admin',expandedId:'secret-battle'});
 assert.equal(s.battles.length,3);assert.equal(s.battles[0].sides.A.attack.type,'P');
 assert.equal(s.battles[0].sides.A.attack.color,'o');assert.notEqual(s.battles[0].sides.A.defense.text,'x'.repeat(400));
 assert.equal(s.viewer,'A');assert.equal(s.view,'feed');assert.equal(s.expandedId,'бой-101');
});
test('browser state mutations affect only the matching battle ID',()=>{
 const s=createState();const other=JSON.stringify(s.battles[1]);
 assert.equal(saveText(s,'бой-101','attack','Это новое'),true);
 assert.equal(JSON.stringify(s.battles[1]),other);
});
test('public-only views cannot be used as an authority to commit',()=>{
 const s=createState();s.viewer='spectator';
 assert.equal(commit(s,'бой-102'),false);assert.equal(pendingMyTurn(s),0);
});