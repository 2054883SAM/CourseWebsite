/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/video/vdocipher-otp/route";
exports.ids = ["app/api/video/vdocipher-otp/route"];
exports.modules = {

/***/ "(rsc)/./app/api/video/vdocipher-otp/route.ts":
/*!**********************************************!*\
  !*** ./app/api/video/vdocipher-otp/route.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n\n// Authentication handling for VdoCipher OTP API\nasync function POST(req) {\n    try {\n        const { videoId } = await req.json();\n        if (!videoId) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Video ID is required'\n            }, {\n                status: 400\n            });\n        }\n        const API_SECRET = process.env.VDO_API_SECRET;\n        if (!API_SECRET) {\n            console.error('VDO_API_SECRET environment variable is not set');\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'API configuration error'\n            }, {\n                status: 500\n            });\n        }\n        // We'll specify the TTL directly in the request body\n        // The video ID is now part of the URL\n        // No need for HMAC signature with this API endpoint\n        // Get OTP from VdoCipher API\n        const apiResponse = await fetch(`https://dev.vdocipher.com/api/videos/${videoId}/otp`, {\n            method: 'POST',\n            headers: {\n                'Content-Type': 'application/json',\n                'Accept': 'application/json',\n                'Authorization': `Apisecret ${API_SECRET}`\n            },\n            body: JSON.stringify({\n                ttl: 3600\n            })\n        });\n        if (!apiResponse.ok) {\n            throw new Error(`VdoCipher API error: ${apiResponse.status} ${apiResponse.statusText}`);\n        }\n        const data = await apiResponse.json();\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(data, {\n            status: 200,\n            headers: {\n                'Access-Control-Allow-Origin': '*'\n            }\n        });\n    } catch (error) {\n        console.error('Error generating VdoCipher OTP:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: error instanceof Error ? error.message : 'Unknown error'\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3ZpZGVvL3Zkb2NpcGhlci1vdHAvcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBMkM7QUFFM0MsZ0RBQWdEO0FBQ3pDLGVBQWVDLEtBQUtDLEdBQVk7SUFDckMsSUFBSTtRQUNGLE1BQU0sRUFBRUMsT0FBTyxFQUFFLEdBQUcsTUFBTUQsSUFBSUUsSUFBSTtRQUVsQyxJQUFJLENBQUNELFNBQVM7WUFDWixPQUFPSCxxREFBWUEsQ0FBQ0ksSUFBSSxDQUN0QjtnQkFBRUMsT0FBTztZQUF1QixHQUNoQztnQkFBRUMsUUFBUTtZQUFJO1FBRWxCO1FBRUEsTUFBTUMsYUFBYUMsUUFBUUMsR0FBRyxDQUFDQyxjQUFjO1FBRTdDLElBQUksQ0FBQ0gsWUFBWTtZQUNmSSxRQUFRTixLQUFLLENBQUM7WUFDZCxPQUFPTCxxREFBWUEsQ0FBQ0ksSUFBSSxDQUN0QjtnQkFBRUMsT0FBTztZQUEwQixHQUNuQztnQkFBRUMsUUFBUTtZQUFJO1FBRWxCO1FBRUEscURBQXFEO1FBQ3JELHNDQUFzQztRQUV0QyxvREFBb0Q7UUFFcEQsNkJBQTZCO1FBQzdCLE1BQU1NLGNBQWMsTUFBTUMsTUFBTSxDQUFDLHFDQUFxQyxFQUFFVixRQUFRLElBQUksQ0FBQyxFQUFFO1lBQ3JGVyxRQUFRO1lBQ1JDLFNBQVM7Z0JBQ1AsZ0JBQWdCO2dCQUNoQixVQUFVO2dCQUNWLGlCQUFpQixDQUFDLFVBQVUsRUFBRVIsWUFBWTtZQUM1QztZQUNBUyxNQUFNQyxLQUFLQyxTQUFTLENBQUM7Z0JBQ25CQyxLQUFLO1lBQ1A7UUFDRjtRQUVBLElBQUksQ0FBQ1AsWUFBWVEsRUFBRSxFQUFFO1lBQ25CLE1BQU0sSUFBSUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFVCxZQUFZTixNQUFNLENBQUMsQ0FBQyxFQUFFTSxZQUFZVSxVQUFVLEVBQUU7UUFDeEY7UUFFQSxNQUFNQyxPQUFPLE1BQU1YLFlBQVlSLElBQUk7UUFFbkMsT0FBT0oscURBQVlBLENBQUNJLElBQUksQ0FBQ21CLE1BQU07WUFDN0JqQixRQUFRO1lBQ1JTLFNBQVM7Z0JBQ1AsK0JBQStCO1lBQ2pDO1FBQ0Y7SUFDRixFQUFFLE9BQU9WLE9BQU87UUFDZE0sUUFBUU4sS0FBSyxDQUFDLG1DQUFtQ0E7UUFFakQsT0FBT0wscURBQVlBLENBQUNJLElBQUksQ0FDdEI7WUFBRUMsT0FBT0EsaUJBQWlCZ0IsUUFBUWhCLE1BQU1tQixPQUFPLEdBQUc7UUFBZ0IsR0FDbEU7WUFBRWxCLFFBQVE7UUFBSTtJQUVsQjtBQUNGIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXEtvbmFuXFxEb2N1bWVudHNcXE1PTlNQQUNFXFxDb3Vyc2VXZWJzaXRlLTFcXGFwcFxcYXBpXFx2aWRlb1xcdmRvY2lwaGVyLW90cFxccm91dGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInO1xyXG5cclxuLy8gQXV0aGVudGljYXRpb24gaGFuZGxpbmcgZm9yIFZkb0NpcGhlciBPVFAgQVBJXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcTogUmVxdWVzdCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB7IHZpZGVvSWQgfSA9IGF3YWl0IHJlcS5qc29uKCk7XHJcblxyXG4gICAgaWYgKCF2aWRlb0lkKSB7XHJcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcclxuICAgICAgICB7IGVycm9yOiAnVmlkZW8gSUQgaXMgcmVxdWlyZWQnIH0sXHJcbiAgICAgICAgeyBzdGF0dXM6IDQwMCB9XHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgQVBJX1NFQ1JFVCA9IHByb2Nlc3MuZW52LlZET19BUElfU0VDUkVUO1xyXG5cclxuICAgIGlmICghQVBJX1NFQ1JFVCkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdWRE9fQVBJX1NFQ1JFVCBlbnZpcm9ubWVudCB2YXJpYWJsZSBpcyBub3Qgc2V0Jyk7XHJcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcclxuICAgICAgICB7IGVycm9yOiAnQVBJIGNvbmZpZ3VyYXRpb24gZXJyb3InIH0sXHJcbiAgICAgICAgeyBzdGF0dXM6IDUwMCB9XHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gV2UnbGwgc3BlY2lmeSB0aGUgVFRMIGRpcmVjdGx5IGluIHRoZSByZXF1ZXN0IGJvZHlcclxuICAgIC8vIFRoZSB2aWRlbyBJRCBpcyBub3cgcGFydCBvZiB0aGUgVVJMXHJcblxyXG4gICAgLy8gTm8gbmVlZCBmb3IgSE1BQyBzaWduYXR1cmUgd2l0aCB0aGlzIEFQSSBlbmRwb2ludFxyXG5cclxuICAgIC8vIEdldCBPVFAgZnJvbSBWZG9DaXBoZXIgQVBJXHJcbiAgICBjb25zdCBhcGlSZXNwb25zZSA9IGF3YWl0IGZldGNoKGBodHRwczovL2Rldi52ZG9jaXBoZXIuY29tL2FwaS92aWRlb3MvJHt2aWRlb0lkfS9vdHBgLCB7XHJcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICdBdXRob3JpemF0aW9uJzogYEFwaXNlY3JldCAke0FQSV9TRUNSRVR9YCxcclxuICAgICAgfSxcclxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgIHR0bDogMzYwMCwgLy8gMSBob3VyIHZhbGlkaXR5XHJcbiAgICAgIH0pLFxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCFhcGlSZXNwb25zZS5vaykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFZkb0NpcGhlciBBUEkgZXJyb3I6ICR7YXBpUmVzcG9uc2Uuc3RhdHVzfSAke2FwaVJlc3BvbnNlLnN0YXR1c1RleHR9YCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IGFwaVJlc3BvbnNlLmpzb24oKTtcclxuICAgIFxyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKGRhdGEsIHtcclxuICAgICAgc3RhdHVzOiAyMDAsXHJcbiAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLCBcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZW5lcmF0aW5nIFZkb0NpcGhlciBPVFA6JywgZXJyb3IpO1xyXG4gICAgXHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXHJcbiAgICAgIHsgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InIH0sXHJcbiAgICAgIHsgc3RhdHVzOiA1MDAgfVxyXG4gICAgKTtcclxuICB9XHJcbn0iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiUE9TVCIsInJlcSIsInZpZGVvSWQiLCJqc29uIiwiZXJyb3IiLCJzdGF0dXMiLCJBUElfU0VDUkVUIiwicHJvY2VzcyIsImVudiIsIlZET19BUElfU0VDUkVUIiwiY29uc29sZSIsImFwaVJlc3BvbnNlIiwiZmV0Y2giLCJtZXRob2QiLCJoZWFkZXJzIiwiYm9keSIsIkpTT04iLCJzdHJpbmdpZnkiLCJ0dGwiLCJvayIsIkVycm9yIiwic3RhdHVzVGV4dCIsImRhdGEiLCJtZXNzYWdlIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/video/vdocipher-otp/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fvideo%2Fvdocipher-otp%2Froute&page=%2Fapi%2Fvideo%2Fvdocipher-otp%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fvideo%2Fvdocipher-otp%2Froute.ts&appDir=C%3A%5CUsers%5CKonan%5CDocuments%5CMONSPACE%5CCourseWebsite-1%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CKonan%5CDocuments%5CMONSPACE%5CCourseWebsite-1&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fvideo%2Fvdocipher-otp%2Froute&page=%2Fapi%2Fvideo%2Fvdocipher-otp%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fvideo%2Fvdocipher-otp%2Froute.ts&appDir=C%3A%5CUsers%5CKonan%5CDocuments%5CMONSPACE%5CCourseWebsite-1%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CKonan%5CDocuments%5CMONSPACE%5CCourseWebsite-1&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_Konan_Documents_MONSPACE_CourseWebsite_1_app_api_video_vdocipher_otp_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/video/vdocipher-otp/route.ts */ \"(rsc)/./app/api/video/vdocipher-otp/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/video/vdocipher-otp/route\",\n        pathname: \"/api/video/vdocipher-otp\",\n        filename: \"route\",\n        bundlePath: \"app/api/video/vdocipher-otp/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\Konan\\\\Documents\\\\MONSPACE\\\\CourseWebsite-1\\\\app\\\\api\\\\video\\\\vdocipher-otp\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_Konan_Documents_MONSPACE_CourseWebsite_1_app_api_video_vdocipher_otp_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZ2aWRlbyUyRnZkb2NpcGhlci1vdHAlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRnZpZGVvJTJGdmRvY2lwaGVyLW90cCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRnZpZGVvJTJGdmRvY2lwaGVyLW90cCUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNLb25hbiU1Q0RvY3VtZW50cyU1Q01PTlNQQUNFJTVDQ291cnNlV2Vic2l0ZS0xJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1DJTNBJTVDVXNlcnMlNUNLb25hbiU1Q0RvY3VtZW50cyU1Q01PTlNQQUNFJTVDQ291cnNlV2Vic2l0ZS0xJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUNnRDtBQUM3SDtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiQzpcXFxcVXNlcnNcXFxcS29uYW5cXFxcRG9jdW1lbnRzXFxcXE1PTlNQQUNFXFxcXENvdXJzZVdlYnNpdGUtMVxcXFxhcHBcXFxcYXBpXFxcXHZpZGVvXFxcXHZkb2NpcGhlci1vdHBcXFxccm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL3ZpZGVvL3Zkb2NpcGhlci1vdHAvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS92aWRlby92ZG9jaXBoZXItb3RwXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS92aWRlby92ZG9jaXBoZXItb3RwL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiQzpcXFxcVXNlcnNcXFxcS29uYW5cXFxcRG9jdW1lbnRzXFxcXE1PTlNQQUNFXFxcXENvdXJzZVdlYnNpdGUtMVxcXFxhcHBcXFxcYXBpXFxcXHZpZGVvXFxcXHZkb2NpcGhlci1vdHBcXFxccm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fvideo%2Fvdocipher-otp%2Froute&page=%2Fapi%2Fvideo%2Fvdocipher-otp%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fvideo%2Fvdocipher-otp%2Froute.ts&appDir=C%3A%5CUsers%5CKonan%5CDocuments%5CMONSPACE%5CCourseWebsite-1%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CKonan%5CDocuments%5CMONSPACE%5CCourseWebsite-1&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@opentelemetry"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fvideo%2Fvdocipher-otp%2Froute&page=%2Fapi%2Fvideo%2Fvdocipher-otp%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fvideo%2Fvdocipher-otp%2Froute.ts&appDir=C%3A%5CUsers%5CKonan%5CDocuments%5CMONSPACE%5CCourseWebsite-1%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CKonan%5CDocuments%5CMONSPACE%5CCourseWebsite-1&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();