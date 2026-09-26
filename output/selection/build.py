from pathlib import Path
root=Path(__file__).resolve().parent
s=(root/"resonance-character-selection.html").read_text()
for name in ['chapter.js', 'learning-notes.js', 'learn-panel.js', 'storm.js', 'final-wave.js', 'block-flow.js', 'reading-layout.js', 'mastery.js', 'collectible.js', 'progress.js', 'defense-scene.js', 'city-reactions.js', 'tutorial-animation.js', 'pacing.js', 'play-layout.js', 'evm-wallet.js', 'nft-artwork.js', 'claim-demo.js', 'nft-preview.js', 'player-profile.js', 'map-controls.js', 'quick-path.js', 'character-lessons.js']:
 s=s.replace("</body>","<script>"+(root/name).read_text()+"</script></body>")
(root/"resonance-playable-v1.html").write_text(s)
