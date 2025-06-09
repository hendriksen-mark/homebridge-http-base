export type NotificationRequestBody = {
    service?: string,
    characteristic: string,
    value: any
}

export function enqueueNotificationRegistrationIfDefined(api: any, log: any,
  notificationID: string, notificationPassword: string,
  handler: any) {
  if (notificationID) {
    api.on('didFinishLaunching', () => {
      // @ts-ignore
      const registration = (globalThis as any).notificationRegistration || api.notificationRegistration;

      if (registration && typeof registration === 'function') {
        try {
          registration(notificationID, handler, notificationPassword);
          log('Detected running notification server. Registered successfully!');
        } catch (error) {
          const errorMessage = (error instanceof Error) ? error.message : String(error);
          log('Could not register notification handler' + errorMessage + '. ID \'' + notificationID + '\' is already taken!');
        }
      }
    });
  }
}
