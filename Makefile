.PHONY: dev dev-detached stop

dev:
	docker compose up

dev-detached:
	docker compose up -d

stop:
	docker compose down
