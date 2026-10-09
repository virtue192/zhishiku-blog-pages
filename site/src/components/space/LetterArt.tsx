export default function LetterArt({ open = false }: { open?: boolean }) {
  return (
    <div class={`letter-art ${open ? "letter-open" : ""}`} aria-hidden="true">
      <div class="letter-shadow" />
      <div class="letter-back" />
      <div class="letter-sheet">
        <span />
        <span />
        <span />
        <i>✳</i>
      </div>
      <div class="letter-front" />
      <div class="letter-flap" />
      <div class="letter-seal">✳</div>
    </div>
  );
}
