go install go.k6.io/xk6/cmd/xk6@latest

xk6 build --with github.com/szkiba/xk6-faker@v0.3.0

./k6 -q run checkout.js
