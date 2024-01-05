import { Keyring } from "@zcloak/keyring";
import { restore } from "@zcloak/did/keys";
import { initCrypto } from "@zcloak/crypto";
import { encryptMessage } from "@zcloak/message";
import { Raw, VerifiableCredentialBuilder } from "@zcloak/vc";

import type { CType } from "@zcloak/ctype/types";
import type { RawCredential } from "@zcloak/vc/types";
import type { VerifiableCredential } from "@zcloak/vc/types";

import { resolver } from "../zclaok/resolverHelper";
import { readDidKeysFile } from "../zclaok/didHelper";
import { getCtypeFromHash } from "../zclaok/ctypeHelper";
import { fromDidDocument } from "@zcloak/did/did/helpers";
import { sendMessage2Server } from "../zclaok/messageHelper";
import { Did } from "@zcloak/did";
import { MyLogger } from '../utils/mylogger';
const logger = new MyLogger();

let inited = false;

export async function issue(receiver: any, ctypeHash: string, contents: any): Promise<string> {
  // initCrypto for wasm
  logger.debug('====issue====1');

  if (!inited) {
    await initCrypto();
    inited = true;
    console.log("initCrypto for wasm...");
  }

  const holderDidUrl = receiver;
  const holderDidDoc = await resolver.resolve(holderDidUrl);
  const holder = fromDidDocument(holderDidDoc);

  const keyring = new Keyring();
  const json = readDidKeysFile();
  const password = process.env.ATTESTER_PWD;
  const attester = restore(keyring, json, password);

  // step1: get ctype
  const ctype: CType = await getCtypeFromHash(ctypeHash);

  // step2: build raw
  const raw = new Raw({
    contents: contents,
    owner: holderDidUrl,
    ctype: ctype,
    hashType: "Keccak256",
  });

  // step3: build rawCredential from raw
  const rawCredential: RawCredential = raw.toRawCredential("Keccak256");

  // step4: build a vcBuilder by using rawCredential and ctype
  const vcBuilder = VerifiableCredentialBuilder.fromRawCredential(
    rawCredential,
    ctype
  )
    .setExpirationDate(null)
    .setIssuanceDate(Date.now());

  // step5: build a vc
  const vc: VerifiableCredential<true> = await vcBuilder.build(
    attester,
    true
  );

  _sendMessage2Server(vc, attester, holder);
  return JSON.stringify(vc);
};

async function _sendMessage2Server(vc: VerifiableCredential<any>, attester: Did, holder: Did) {
  // encrypt message
  // notice: receiverUrl parameter is holder's keyAgreement key
  const message = await encryptMessage(
    "Send_issuedVC",
    vc,
    attester,
    holder.getKeyUrl("keyAgreement"),
    undefined,
    resolver
  );

  // send encrypted message to server
  await sendMessage2Server(message);
  logger.debug('====_sendMessage2Server====2');
}