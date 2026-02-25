# branch-chrome-extension

A Chrome extension for creating Branch links

# How to deploy this thing
Note that instructions below are done using the web store's beta UI. You should be able to opt into it at the top of the old homepage.

1. The portal for managing the version / deployment is Google's Chrome Web Store. You should be able to access with your Branch.io email. If not, contact Alex A. Here is the link https://chrome.google.com/u/1/webstore/devconsole/g07648451938746536848?hl=en 

2. To upload a new package, click on the "Branch Link Creator" in the dev console and select "Package" from the left hand menu. Here's the link https://chrome.google.com/u/1/webstore/devconsole/g07648451938746536848/pekdpppibljpmpbcjelehhnldnfbglgf/edit/package?hl=en

3. Update the "manifest.json" file in the root directory of the repo to increment the "version" string.

4. Prep the package for uploading:
  ```bash
  ./scripts/prep-package.sh
  ```
 
5. In the package section of the dev console, click "Upload Updated Package" and choose the new zip file you just created.

6. It should take you to the "Store Listing" section after the upload finishes. Click "Publish Item" and it will be submitted for review.

7. It should automatically be deployed after the review finishes!

# Useful resources
1. Create and publish custom Chrome apps & extensions: https://support.google.com/chrome/a/answer/2714278?hl=en#
