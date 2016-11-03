#ifndef KEYCHAIN_KEYCHAIN_H_
#define KEYCHAIN_KEYCHAIN_H_

#include <CoreFoundation/CoreFoundation.h>

int32_t getIdentityPkcs12(char *subject, char **outIdentity, long **outLength, char **outError);
OSStatus CF_getIdentityPkcs12(CFStringRef subject, CFDataRef *outIdentity);

int32_t addIdentityPkcs12(char *identity, long length, char *passphrase, char **outError);
OSStatus CF_addIdentityPkcs12(CFDataRef identityData, CFStringRef passphrase);

char * unwrapError(OSStatus status);

#endif
