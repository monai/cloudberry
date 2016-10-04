#ifndef EXAMPLES_ASYNC_PI_ESTIMATE_ASYNC_H_
#define EXAMPLES_ASYNC_PI_ESTIMATE_ASYNC_H_

#include <nan.h>

using Nan::AsyncWorker;
using Nan::Callback;

NAN_METHOD(GetIdentity);
NAN_METHOD(AddIdentity);

class GetIdentityWorker : public AsyncWorker {
 public:
  GetIdentityWorker(Callback *callback, char *label)
    : AsyncWorker(callback), label(label), error(NULL) {}
  ~GetIdentityWorker() {}
  void Execute();
  void HandleOKCallback ();

 private:
  char *label;
  char *data;
  long *length;
  char *error;
};

class AddIdentityWorker : public AsyncWorker {
 public:
  AddIdentityWorker(Callback *callback, char *data, long length)
    : AsyncWorker(callback), data(data), length(length), error(NULL) {}
  ~AddIdentityWorker() {}
  void Execute();
  void HandleOKCallback ();

 private:
  char *data;
  long length;
  char *error;
};

#endif
