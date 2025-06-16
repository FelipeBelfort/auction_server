IMAGE_NAME=auction-server
CONTAINER_NAME=bid-server

PORT := $(shell grep PORT .env | cut -d '=' -f2)

all: start

build:
	docker build -t $(IMAGE_NAME) .

run:
	docker run --name $(CONTAINER_NAME) --env-file .env -p $(PORT):$(PORT) $(IMAGE_NAME)

start: build run

dev: build
	docker run -it --rm\
		--name $(CONTAINER_NAME)\
		-p $(PORT):$(PORT) \
		--env-file .env \
		-v $(PWD):/app \
		-w /app \
		node:20-alpine sh -c "npm install && npm run dev"

shell:
	docker run -it --entrypoint sh $(IMAGE_NAME)

clean:
	-docker stop $(CONTAINER_NAME)
	-docker rm $(CONTAINER_NAME)

fclean: clean
	-docker rmi $(IMAGE_NAME)

rebuild:
	docker build --no-cache -t $(IMAGE_NAME) .

re: fclean all

.PHONY: build run start shell clean fclean rebuild re