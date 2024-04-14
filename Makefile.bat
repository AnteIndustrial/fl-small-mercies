rmdir /s /q dist
mkdir dist
copy src\background.html dist\background.html
echo D | xcopy src\css dist\css /e
echo D | xcopy src\images dist\images /e
npx webpack
