.PHONY: start shutdown

start:
	docker compose up --build --detach

shutdown:
	docker compose down
