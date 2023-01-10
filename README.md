# How to test with k8s backend:
1. go to main.ts and set the flag "k8s = true" (row 11). 

# How to test with aws backend: 
1. go to main.ts and set the flag "k8s = false" (row 11).

# How to deploy
1. run ng build --prod
2. go to your aws dashboard
3. open s3 service console
4. create a new bucket with public access
5. go to properties tab of your bucket
6. edit the hosting section and set "index.html" as first page
7. go to authorization tab of yout bucket
8. set the allow policy for "*" for the action "s3:getObject".
9. upload all files from "FRONTEND_CM/src/dist" to your bucket main directory
10. go to your bucket endpoint


