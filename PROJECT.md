# CRM Customer Intelligence Dashboard

## Overview

A modern CRM dashboard for support and customer-facing teams to understand customer behavior, analyze purchasing patterns, and quickly investigate individual customer profiles.

The application uses the [DummyJSON](https://dummyjson.com/) API as its data source and transforms its users, carts, and product data into a unified customer-focused experience.

The project is designed to demonstrate production-quality frontend engineering through realistic data relationships, responsive UI, client-side data transformation, filtering, routing, data visualization, testing, and thoughtful handling of incomplete data.

## Goals

* Provide a clear overview of customer and purchasing activity.
* Make it easy to search, filter, and investigate customers.
* Turn raw API data into useful customer insights.
* Handle missing purchase data intentionally rather than hiding it.
* Demonstrate strong frontend architecture and user experience.

## Core Features

### Authentication

* Demo analyst login
* Protected application routes
* Persistent authentication state
* Logout

### Dashboard Overview

* Customer and purchase KPIs
* Customer segment breakdown
* Revenue and spending analysis
* Purchase-history coverage
* Purchase and spending distributions
* Product insights

### Customer Management

* Customer list containing all 208 users
* Search, sorting, filtering, and pagination
* Customer segmentation
* Purchase-history status
* Responsive data table

### Customer Profiles

* Customer information
* Segment and purchase status
* Total purchases
* Total spend
* Purchase history
* Purchased products
* Derived customer insights

### Product Analytics

* Top Products by Quantity
* Most Popular Products
* Product ratings
* Product purchasing patterns

### Navigation & UX

* Client-side routing
* URL-based filter state
* Responsive layouts
* Loading states
* Error states
* Empty states
* Accessible interactive components

## Customer Data Model

The dashboard uses the complete DummyJSON user population rather than only users with purchase data.

There are **208 users** and **50 carts**.

Users and carts are fetched in two bulk requests and joined client-side by `userId`. Individual cart requests are intentionally avoided.

Customers without cart data remain visible and receive a **No Purchase History** state.

## Purchases

In the dashboard's user-facing UI, DummyJSON carts are represented as **Purchases**.

> Each DummyJSON cart is treated as one completed purchase for the purposes of this dashboard.

The raw API terminology remains internal to the application.

## Customer Segmentation

Customers with purchase history are assigned to one of four segments:

* **VIP**
* **High Value**
* **Standard**
* **At Risk**

Segment thresholds are derived from the dataset rather than arbitrary fixed values.

**At Risk** represents low purchasing engagement based on available purchase data. It does not imply actual churn risk because DummyJSON provides no historical or time-based customer activity.

**No Purchase History is not a segment.** It is a separate purchase-status state for customers without available purchase data.

## Data Integrity

The application does not fabricate backend data.

DummyJSON does not provide:

* Support tickets
* Customer satisfaction scores
* Account creation dates
* Purchase dates
* Customer activity timestamps

Therefore, the application does not invent these values or build features that depend on them.

All dashboard metrics and visualizations must be directly available from, or deterministically derived from, the provided DummyJSON data.

## Scope

The core application consists of:

* Authentication
* Dashboard Overview
* Customer List
* Customer Profile
* Purchase history
* Product analytics
* Filtering and search
* Responsive design
* Loading, error, and empty states
* Automated frontend tests

The project intentionally avoids unrelated features that cannot be meaningfully supported by the available data.

## Primary Objective

Build a polished, realistic CRM experience that demonstrates the ability to take imperfect external API data, model meaningful relationships between resources, and turn that data into a useful and maintainable frontend application.
