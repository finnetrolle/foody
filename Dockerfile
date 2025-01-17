FROM python:3.12.7-alpine

COPY ./ /opt/app

ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US.UTF-8
ENV LC_ALL=en_US.UTF-8

WORKDIR /opt/app

RUN pip install -r requirements

EXPOSE 8080

CMD python server.py
