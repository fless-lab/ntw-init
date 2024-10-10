### Features Directory - Developer Notes

This directory (`features`) contains the core functional modules of the application, such as `user`, `otp`, and other business-related features. Each module is self-contained and handles its specific logic, such as models, services, controllers, or routes.

The purpose of this directory is to allow each module to be reusable across different parts of the application. For example, the `otp` module can expose services or utilities that can be used in other apps or features. This structure ensures that functionality can be shared efficiently between different parts of the system while keeping the codebase organized and maintainable.
