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
exports.id = "app/api/auth/cookie/route";
exports.ids = ["app/api/auth/cookie/route"];
exports.modules = {

/***/ "(rsc)/./app/api/auth/cookie/route.ts":
/*!**************************************!*\
  !*** ./app/api/auth/cookie/route.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _supabase_ssr__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @supabase/ssr */ \"(rsc)/./node_modules/@supabase/ssr/dist/module/index.js\");\n\n\nasync function POST(req) {\n    const res = new next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse();\n    // Create Supabase server client\n    const supabase = (0,_supabase_ssr__WEBPACK_IMPORTED_MODULE_1__.createServerClient)(\"https://qrowzznnnarfogfbnnow.supabase.co\", \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyb3d6em5ubmFyZm9nZmJubm93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNjg1MzUsImV4cCI6MjA2NzY0NDUzNX0.MkCeFSLoOyGl-y1_eZTXTXXV8hGOJM7WuBV7gvLc_rI\", {\n        cookies: {\n            get: (name)=>req.cookies.get(name)?.value,\n            set: (name, value, options)=>{\n                res.cookies.set({\n                    name,\n                    value,\n                    ...options\n                });\n            },\n            remove: (name, options)=>{\n                res.cookies.delete({\n                    name,\n                    ...options\n                });\n            }\n        }\n    });\n    // Parse tokens from request body\n    const { access_token, refresh_token } = await req.json();\n    // Set session server-side (this sets the cookie)\n    const { error } = await supabase.auth.setSession({\n        access_token,\n        refresh_token\n    });\n    if (error) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: error.message\n        }, {\n            status: 401\n        });\n    }\n    // Return success and forward response with updated cookies\n    return res;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvY29va2llL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUF3RDtBQUNMO0FBRzVDLGVBQWVFLEtBQUtDLEdBQWdCO0lBQ3pDLE1BQU1DLE1BQU0sSUFBSUoscURBQVlBO0lBRTVCLGdDQUFnQztJQUNoQyxNQUFNSyxXQUFXSixpRUFBa0JBLENBQ2pDSywwQ0FBb0MsRUFDcENBLGtOQUF5QyxFQUN6QztRQUNFSSxTQUFTO1lBQ1BDLEtBQUssQ0FBQ0MsT0FBU1QsSUFBSU8sT0FBTyxDQUFDQyxHQUFHLENBQUNDLE9BQU9DO1lBQ3RDQyxLQUFLLENBQUNGLE1BQU1DLE9BQU9FO2dCQUNqQlgsSUFBSU0sT0FBTyxDQUFDSSxHQUFHLENBQUM7b0JBQ2RGO29CQUNBQztvQkFDQSxHQUFHRSxPQUFPO2dCQUNaO1lBQ0Y7WUFDQUMsUUFBUSxDQUFDSixNQUFNRztnQkFDYlgsSUFBSU0sT0FBTyxDQUFDTyxNQUFNLENBQUM7b0JBQ2pCTDtvQkFDQSxHQUFHRyxPQUFPO2dCQUNaO1lBQ0Y7UUFDRjtJQUNGO0lBR0YsaUNBQWlDO0lBQ2pDLE1BQU0sRUFBRUcsWUFBWSxFQUFFQyxhQUFhLEVBQUUsR0FBRyxNQUFNaEIsSUFBSWlCLElBQUk7SUFFdEQsaURBQWlEO0lBQ2pELE1BQU0sRUFBRUMsS0FBSyxFQUFFLEdBQUcsTUFBTWhCLFNBQVNpQixJQUFJLENBQUNDLFVBQVUsQ0FBQztRQUMvQ0w7UUFDQUM7SUFDRjtJQUVBLElBQUlFLE9BQU87UUFDVCxPQUFPckIscURBQVlBLENBQUNvQixJQUFJLENBQUM7WUFBRUMsT0FBT0EsTUFBTUcsT0FBTztRQUFDLEdBQUc7WUFBRUMsUUFBUTtRQUFJO0lBQ25FO0lBRUEsMkRBQTJEO0lBQzNELE9BQU9yQjtBQUNUIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXEtvbmFuXFxEb2N1bWVudHNcXE1PTlNQQUNFXFxDb3Vyc2VXZWJzaXRlLTFcXGFwcFxcYXBpXFxhdXRoXFxjb29raWVcXHJvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXF1ZXN0LCBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcic7XHJcbmltcG9ydCB7IGNyZWF0ZVNlcnZlckNsaWVudCB9IGZyb20gJ0BzdXBhYmFzZS9zc3InO1xyXG5pbXBvcnQgeyBEYXRhYmFzZSB9IGZyb20gJ0AvdHlwZXMvc3VwYWJhc2UnO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QocmVxOiBOZXh0UmVxdWVzdCkge1xyXG4gIGNvbnN0IHJlcyA9IG5ldyBOZXh0UmVzcG9uc2UoKTtcclxuXHJcbiAgLy8gQ3JlYXRlIFN1cGFiYXNlIHNlcnZlciBjbGllbnRcclxuICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZVNlcnZlckNsaWVudDxEYXRhYmFzZT4oXHJcbiAgICBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwhLFxyXG4gICAgcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVkhLFxyXG4gICAge1xyXG4gICAgICBjb29raWVzOiB7XHJcbiAgICAgICAgZ2V0OiAobmFtZSkgPT4gcmVxLmNvb2tpZXMuZ2V0KG5hbWUpPy52YWx1ZSxcclxuICAgICAgICBzZXQ6IChuYW1lLCB2YWx1ZSwgb3B0aW9ucykgPT4ge1xyXG4gICAgICAgICAgcmVzLmNvb2tpZXMuc2V0KHtcclxuICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgdmFsdWUsXHJcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlbW92ZTogKG5hbWUsIG9wdGlvbnMpID0+IHtcclxuICAgICAgICAgIHJlcy5jb29raWVzLmRlbGV0ZSh7XHJcbiAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfVxyXG4gICk7XHJcblxyXG4gIC8vIFBhcnNlIHRva2VucyBmcm9tIHJlcXVlc3QgYm9keVxyXG4gIGNvbnN0IHsgYWNjZXNzX3Rva2VuLCByZWZyZXNoX3Rva2VuIH0gPSBhd2FpdCByZXEuanNvbigpO1xyXG5cclxuICAvLyBTZXQgc2Vzc2lvbiBzZXJ2ZXItc2lkZSAodGhpcyBzZXRzIHRoZSBjb29raWUpXHJcbiAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5zZXRTZXNzaW9uKHtcclxuICAgIGFjY2Vzc190b2tlbixcclxuICAgIHJlZnJlc2hfdG9rZW4sXHJcbiAgfSk7XHJcblxyXG4gIGlmIChlcnJvcikge1xyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSwgeyBzdGF0dXM6IDQwMSB9KTtcclxuICB9XHJcblxyXG4gIC8vIFJldHVybiBzdWNjZXNzIGFuZCBmb3J3YXJkIHJlc3BvbnNlIHdpdGggdXBkYXRlZCBjb29raWVzXHJcbiAgcmV0dXJuIHJlcztcclxufVxyXG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiY3JlYXRlU2VydmVyQ2xpZW50IiwiUE9TVCIsInJlcSIsInJlcyIsInN1cGFiYXNlIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX0FOT05fS0VZIiwiY29va2llcyIsImdldCIsIm5hbWUiLCJ2YWx1ZSIsInNldCIsIm9wdGlvbnMiLCJyZW1vdmUiLCJkZWxldGUiLCJhY2Nlc3NfdG9rZW4iLCJyZWZyZXNoX3Rva2VuIiwianNvbiIsImVycm9yIiwiYXV0aCIsInNldFNlc3Npb24iLCJtZXNzYWdlIiwic3RhdHVzIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/cookie/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2Fcookie%2Froute&page=%2Fapi%2Fauth%2Fcookie%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fcookie%2Froute.ts&appDir=C%3A%5CUsers%5CKonan%5CDocuments%5CMONSPACE%5CCourseWebsite-1%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CKonan%5CDocuments%5CMONSPACE%5CCourseWebsite-1&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2Fcookie%2Froute&page=%2Fapi%2Fauth%2Fcookie%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fcookie%2Froute.ts&appDir=C%3A%5CUsers%5CKonan%5CDocuments%5CMONSPACE%5CCourseWebsite-1%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CKonan%5CDocuments%5CMONSPACE%5CCourseWebsite-1&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_Konan_Documents_MONSPACE_CourseWebsite_1_app_api_auth_cookie_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/auth/cookie/route.ts */ \"(rsc)/./app/api/auth/cookie/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/cookie/route\",\n        pathname: \"/api/auth/cookie\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/cookie/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\Konan\\\\Documents\\\\MONSPACE\\\\CourseWebsite-1\\\\app\\\\api\\\\auth\\\\cookie\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_Konan_Documents_MONSPACE_CourseWebsite_1_app_api_auth_cookie_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGY29va2llJTJGcm91dGUmcGFnZT0lMkZhcGklMkZhdXRoJTJGY29va2llJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGYXV0aCUyRmNvb2tpZSUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNLb25hbiU1Q0RvY3VtZW50cyU1Q01PTlNQQUNFJTVDQ291cnNlV2Vic2l0ZS0xJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1DJTNBJTVDVXNlcnMlNUNLb25hbiU1Q0RvY3VtZW50cyU1Q01PTlNQQUNFJTVDQ291cnNlV2Vic2l0ZS0xJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUN3QztBQUNySDtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiQzpcXFxcVXNlcnNcXFxcS29uYW5cXFxcRG9jdW1lbnRzXFxcXE1PTlNQQUNFXFxcXENvdXJzZVdlYnNpdGUtMVxcXFxhcHBcXFxcYXBpXFxcXGF1dGhcXFxcY29va2llXFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9hdXRoL2Nvb2tpZS9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2F1dGgvY29va2llXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9hdXRoL2Nvb2tpZS9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXFVzZXJzXFxcXEtvbmFuXFxcXERvY3VtZW50c1xcXFxNT05TUEFDRVxcXFxDb3Vyc2VXZWJzaXRlLTFcXFxcYXBwXFxcXGFwaVxcXFxhdXRoXFxcXGNvb2tpZVxcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2Fcookie%2Froute&page=%2Fapi%2Fauth%2Fcookie%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fcookie%2Froute.ts&appDir=C%3A%5CUsers%5CKonan%5CDocuments%5CMONSPACE%5CCourseWebsite-1%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CKonan%5CDocuments%5CMONSPACE%5CCourseWebsite-1&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

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

/***/ "?32c4":
/*!****************************!*\
  !*** bufferutil (ignored) ***!
  \****************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?66e9":
/*!********************************!*\
  !*** utf-8-validate (ignored) ***!
  \********************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "net":
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("net");

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

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "tls":
/*!**********************!*\
  !*** external "tls" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("tls");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tr46","vendor-chunks/ws","vendor-chunks/@opentelemetry","vendor-chunks/whatwg-url","vendor-chunks/webidl-conversions","vendor-chunks/isows"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2Fcookie%2Froute&page=%2Fapi%2Fauth%2Fcookie%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fcookie%2Froute.ts&appDir=C%3A%5CUsers%5CKonan%5CDocuments%5CMONSPACE%5CCourseWebsite-1%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CKonan%5CDocuments%5CMONSPACE%5CCourseWebsite-1&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();