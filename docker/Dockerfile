FROM harbor.k8s.lab.whirly.pl/base/nginx-unprivileged:1.30-alpine

COPY --from=build /app/dist/nn-gc-addins /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
