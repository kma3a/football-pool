function deletePick(pickId) {
  var confirmPick = window.confirm("Are you sure you would like to delete this pick?");
  if (confirmPick) {
    $.ajax({
      url: '/picks/' + pickId,
      type: "DELETE",
      success: success,
      failure: fail
    });
  }
}

function success() {
  console.log("you did it!");
  location.reload();
}
function fail(err) {
  console.log("you made a mistake", err);
}
