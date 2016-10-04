#include <nan.h>
#include <node.h>
#include "async.h"
#include "keychain.h"

using v8::Function;
using v8::Local;
using v8::Object;
using v8::Value;
using Nan::AsyncQueueWorker;
using Nan::Callback;
using Nan::Error;
using Nan::HandleScope;
using Nan::NewBuffer;
using Nan::Null;
using Nan::Undefined;
using Nan::Utf8String;

void GetIdentityWorker::Execute() {
  getIdentityPkcs12(label, &data, &length, &error);
}

void GetIdentityWorker::HandleOKCallback () {
  HandleScope scope;

  Local<Value> errorValue;
  Local<Value> bufferValue;

  if (error != NULL) {
    errorValue = Error(error);
    bufferValue = Undefined();
  } else {
    errorValue = Null();
    bufferValue = NewBuffer(data, (long)length).ToLocalChecked();
  }

  Local<Value> argv[] = {
    errorValue
  , bufferValue
  };

  callback->Call(2, argv);
}

void AddIdentityWorker::HandleOKCallback () {
  HandleScope scope;

  Local<Value> argv[] = {
    (error != NULL) ? Error(error) : Local<Value>(Null())
  };

  callback->Call(1, argv);
}

void AddIdentityWorker::Execute() {
  addIdentityPkcs12(data, length, &error);
}

NAN_METHOD(GetIdentity) {
  Utf8String *label = new Utf8String(info[0]);
  Callback *callback = new Callback(info[1].As<Function>());

  AsyncQueueWorker(new GetIdentityWorker(callback, **label));
}

NAN_METHOD(AddIdentity) {
  Local<Object> identity = info[0]->ToObject();
  char *data = node::Buffer::Data(identity);
  long length = node::Buffer::Length(identity);
  Callback *callback = new Callback(info[1].As<Function>());

  AsyncQueueWorker(new AddIdentityWorker(callback, data, length));
}
