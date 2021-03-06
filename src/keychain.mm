#import <CoreFoundation/CoreFoundation.h>
#import <Security/Security.h>

#include "keychain.h"
#include "reallocarray.h"

int32_t getIdentityPkcs12(char *subject, char **outIdentity, long **outLength, char **outError) {
  CFStringRef subjectRef = CFStringCreateWithCString(NULL, subject, kCFStringEncodingUTF8);
  CFDataRef identityDataRef = NULL;

  OSStatus status = CF_getIdentityPkcs12(subjectRef, &identityDataRef);
  CFRelease(subjectRef);
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

OSStatus CF_getIdentityPkcs12(CFStringRef subject, CFDataRef *outIdentity) {
  OSStatus status;

  CFDictionaryRef query;
  CFTypeRef identityRef;

  const void *keys[] = { kSecClass, kSecMatchSubjectWholeString, kSecAttrCanSign, kSecReturnRef };
  const void *values[] = { kSecClassIdentity, subject, kCFBooleanTrue, kCFBooleanTrue };
  query = CFDictionaryCreate(NULL, keys, values, 3, NULL, NULL);

  status = SecItemCopyMatching(query, &identityRef);
  CFRelease(query);
  if (status != errSecSuccess) {
    return status;
  }

  SecItemImportExportKeyParameters params;
  params.keyUsage = NULL;
  params.keyAttributes = NULL;

  status = SecItemExport(identityRef, kSecFormatPKCS12, 0, &params, outIdentity);
  CFRelease(identityRef);
  if (status != errSecSuccess) {
    return status;
  }

  return (int32_t)errSecSuccess;
}

int32_t addIdentityPkcs12(char *identity, long length, char *passphrase, char **outError) {
  CFDataRef identityRef = CFDataCreate(NULL, (const UInt8 *)identity, length);
  CFStringRef passphraseRef = CFStringCreateWithCString(NULL, passphrase, kCFStringEncodingUTF8);
  OSStatus status = CF_addIdentityPkcs12(identityRef, passphraseRef);
  CFRelease(identityRef);
  if (status != errSecSuccess) {
    *outError = unwrapError(status);
    return (int32_t)status;
  }

  return errSecSuccess;
}

OSStatus CF_addIdentityPkcs12(CFDataRef identityData, CFStringRef passphrase) {
  OSStatus status;
  SecKeychainRef keychain;

  status = SecKeychainCopyDefault(&keychain);
  if (status != errSecSuccess) {
    if (keychain) CFRelease(keychain);
    return status;
  }

  SecExternalFormat format = kSecFormatPKCS12;
  SecExternalItemType type = kSecItemTypeAggregate;

  SecItemImportExportKeyParameters params;
  memset(&params, 0, sizeof(SecKeyImportExportParameters));
  params.keyUsage = NULL;
  params.keyAttributes = NULL;
  params.passphrase = passphrase;

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
