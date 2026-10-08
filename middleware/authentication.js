function authentication(request, _response, next) {
  const userId = request.get("x-user-id");

  if (userId) {
    request.user = { id: userId };
  }

  next();
}

module.exports = { authentication };
