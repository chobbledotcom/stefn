debugText.font = "8 Arial black";

function debug() {
  clearCanvas(debugText);
  baddies.forEach((baddy) => {
    if (baddy.debugMessage)
      debugText.fillText(
        JSON.stringify(baddy.debugMessage),
        baddy.x + baddy.width + 2,
        baddy.y + baddy.height + 2
      );
  });
}
