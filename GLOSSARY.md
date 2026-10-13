# Nitro Web Redirect

A service that answers every incoming request with a redirect to one configured destination, keeping the requested path and query.

## Redirecting

**Redirect Target**:
The single destination every request is sent to: a host, optionally with a protocol and a base path.
_Avoid_: destination, upstream, target URL

**Base Path**:
The path part of a Redirect Target, placed in front of the requested path.
_Avoid_: prefix, root path

**Redirect Status Code**:
The HTTP status a redirect answers with; one of 301, 302, 303, 307 or 308.
_Avoid_: redirect type, status

**Location**:
The full address a single request is redirected to, built from the Redirect Target and the requested path and query.
_Avoid_: redirect URL, result URL

**Configuration**:
The Redirect Target and Redirect Status Code a running instance serves; it is valid or the instance does not start.
_Avoid_: settings, env

## Shipping

**Release**:
A version of the service, named by a `vX.Y.Z` tag on `main`, with its own section in the changelog.
_Avoid_: deploy, version bump

**Production**:
The published image on Docker Hub; no running instance belongs to this project.
_Avoid_: live, prod server
