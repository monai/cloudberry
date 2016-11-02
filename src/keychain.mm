#import <CoreFoundation/CoreFoundation.h>
#import <Security/Security.h>

#include "keychain.h"
#include "reallocarray.h"

int32_t getIdentityPkcs12(char *label, char **outIdentity, long **outLength, char **outError) {
  CFStringRef labelRef = CFStringCreateWithCString(NULL, label, kCFStringEncodingUTF8);
  CFDataRef identityDataRef = NULL;

  OSStatus status = CF_getIdentityPkcs12(labelRef, &identityDataRef);
  CFRelease(labelRef);
  if (status != errSecSuccess) {
    *outError = unwrapError(status);
    return (int32_t)status;
  }

  CFIndex length = CFDataGetLength(identityDataRef);
  UInt8 *buffer = (UInt8 *)reallocarray(NULL, length, sizeof(CFIndex));

  CFDataGetBytes(identityDataRef, CFRangeMake(0, CFDataGetLength(identityDataRef)), buffer);

  *outIdentity = (char *)buffer;
  *outLength = (long *)length;

  return (int32_t)errSecSuccess;
}

OSStatus CF_getIdentityPkcs12(CFStringRef label, CFDataRef *outIdentity) {
  OSStatus status;

  CFDictionaryRef query;
  CFTypeRef identityRef;

  const void *keys[] = { kSecClass, kSecMatchSubjectWholeString, kSecAttrCanSign, kSecReturnRef };
  const void *values[] = { kSecClassIdentity, label, kCFBooleanTrue, kCFBooleanTrue };
  query = CFDictionaryCreate(NULL, keys, values, 3, NULL, NULL);

  status = SecItemCopyMatching(query, &identityRef);
  CFRelease(query);
  if (status != errSecSuccess) {
    return status;
  }

  SecItemImportExportKeyParameters params;
  params.keyUsage = NULL;
  params.keyAttributes = NULL;
  params.passphrase = CFSTR("");

  status = SecItemExport(identityRef, kSecFormatPKCS12, 0, &params, outIdentity);
  CFRelease(identityRef);
  if (status != errSecSuccess) {
    return status;
  }

  return (int32_t)errSecSuccess;
}

int32_t addIdentityPkcs12(char *identity, long length, char **outError) {
  CFDataRef identityRef = CFDataCreate(NULL, (const UInt8 *)identity, length);
  OSStatus status = CF_addIdentityPkcs12(identityRef);
  CFRelease(identityRef);
  if (status != errSecSuccess) {
    *outError = unwrapError(status);
    return (int32_t)status;
  }

  return errSecSuccess;
}

OSStatus CF_addIdentityPkcs12(CFDataRef identityData) {
  OSStatus status;
  SecKeychainRef keychain;

  status = SecKeychainCopyDefault(&keychain);
  if (status != errSecSuccess) {
    if (keychain) CFRelease(keychain);
    return status;
  }

  SecExternalFormat format = kSecFormatPKCS12;
  SecExternalItemType type = kSecItemTypeUnknown;

  SecItemImportExportKeyParameters params;
  memset(&params, 0, sizeof(SecKeyImportExportParameters));
  params.keyUsage = NULL;
  params.keyAttributes = NULL;
  params.passphrase = CFSTR("");

  status = SecItemImport(identityData, NULL, &format, &type, 0, &params, keychain, NULL);
  CFRelease(keychain);
  if (status != errSecSuccess) {
    return status;
  }

  return errSecSuccess;
}

char * unwrapError(OSStatus status) {
  CFStringRef error = SecCopyErrorMessageString(status, NULL);
  CFIndex length = CFStringGetLength(error);
  CFIndex maxSize = CFStringGetMaximumSizeForEncoding(length, kCFStringEncodingUTF8) + 1;
  char *buffer = (char *)reallocarray(NULL, maxSize, sizeof(char));
  CFStringGetCString(error, buffer, maxSize, kCFStringEncodingUTF8);
  CFRelease(error);
  return buffer;
}
