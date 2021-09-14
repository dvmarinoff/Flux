//
// UUID
//
// Source:
// https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid/65500983#answer-65500983
//
// Usage:
// eval: console.log(Xuid.v4New)
// emits: {1eb4a659-8bdc-4ce0-c002-b1d505d38ea8}

class Xuid {
  //@ edges.sm.st, ess.dev: MIT license Smallscript/David Simmons 2020
  //! Can't use `static const field = const` xbrowser (thus, const's duped)
  static get v4New() {
      const ns7Now = this.ns7Now, xnode48 = this.xnode48;
      let clock_seq13
      // monotonic `clock_seq` guarantee (13-bits/time-quantum)
      if(ns7Now <= this.ns7Now_prevSeq && this.ns7Now_prevSeq) {
          clock_seq13 = ((this.ns7Now_prevSeq += 1n) - ns7Now) & 0b1_1111_1111_1111n;
      } else {
          clock_seq13 = 0n,
          this.ns7Now_prevSeq = ns7Now
      }
      const time60 = ((ns7Now << 4n) & 0xFFFF_FFFF_FFFF_0000n) | (ns7Now & 0x0000_0000_0000_0FFFn),
                v4 = 0x1_00000000_0000_0000_0000_000000000000n |
                     (time60 << 64n) | (0x00000000_0000_4000_0000_000000000000n) | // M: V4
                     (0b110n << 61n) | (clock_seq13 << 48n) | // N: Variant-2 time-seq collation
                     xnode48,
                 s = v4.toString(16);//.substr(1)
      return `{${s.substr(1,8)}-${s.substr(9,4)}-${s.substr(13,4)}-${s.substr(17,4)}-${s.substr(21,12)}}`;
  }
  static get xnode48()/*:<BigInt#48>*/{
    if(this.xnode48_) return this.xnode48_
    let clockSeqNode; if(typeof URL !== 'undefined' && URL.createObjectURL) {
      const url = URL.createObjectURL(new Blob())
      const id = (url.toString().split('/').reverse()[0]).split('-')
      URL.revokeObjectURL(url)
      clockSeqNode = BigInt('0x'+id[3]+id[4])
    }
    else {
      const a4 = this.a4; this.getRandomValues(this.a4);
      clockSeqNode = (BigInt(a4[2]) << 32n) | BigInt(a4[3])
    }
    // simulate the 48-bit node-id and 13-bit clock-seq
    // to combine with 3-bit uuid-variant
    return this.xnode48_ = clockSeqNode & 0xFFFF_FFFF_FFFFn;
  }
  static get jdNow()/*:<double#ns7>*/{
    // return 2440587.5+Date.now()/864e5 // <- Date-quantum-ms form (7ns form below)
    return this.jdFromNs7(this.ns7Now)
  }
  static get ns7Now()/*:<BigInt#60>*/{
    if(typeof performance !== 'undefined' && performance.now)
      Reflect.defineProperty(this, 'ns7Now',
        Reflect.getOwnPropertyDescriptor(this,'ns7Now_performance'))
    else
      Reflect.defineProperty(this, 'ns7Now',
        Reflect.getOwnPropertyDescriptor(this, 'ns7Now_Date'))
    return this.ns7Now
  }
  static get ns7Now_Date()/*:<BigInt#60>*/{
    // const epoch1582Ns7_bias = 0x1b2_1dd2_1381_4000  // V1 1582 Oct 15
    // const epoch1601Ns7_bias = 0x19d_b1de_d53e_8000n // FILETIME base
    const epoch1970Ns7 = BigInt(Date.now() * 1000_0.0)
    return epoch1970Ns7 + 0x1b2_1dd2_1381_4000n
  }
  static get ns7Now_performance()/*:<BigInt#60>*/{
    const epochPgNs7 = BigInt(performance.now()*/*15*/1000_0.0|/*17*/0)
    if(!this.epoch1970PgNs7) // performance.timing.navigationStart
      this.epoch1970PgNs7 = this.ns7Now_Date - epochPgNs7
    return epochPgNs7 + this.epoch1970PgNs7
  }
  static dateFromJd(jd) {return new Date((jd - 2440587.5) * 864e5)}
  static dateFromNs7(ns7) {
    return new Date(Number(ns7 - 0x1b2_1dd2_1381_4000n) / 1000_0.0)}
  static jdFromNs7(ns7) {   // atomic-clock leap-seconds (ignored)
    return 2440587.5 + (Number(ns7 - 0x1b2_1dd2_1381_4000n) / 864e9)
  }
  static ns7FromJd(jd) {
    return BigInt((jd - 2440587.5) * 864e9) + 0x1b2_1dd2_1381_4000n
  }
  static getRandomValues(va/*:<Uint32Array>*/) {
    if(typeof crypto !== 'undefined' && crypto.getRandomValues)
      crypto.getRandomValues(va)
    else for(let i = 0, n = va.length; i < n; i += 1)
      va[i] = Math.random() * 0x1_0000_0000 >>> 0
  }
  static get a4() {return this.a4_ || (this.a4_ = new Uint32Array(4))}
  static ntohl(v)/*:<BigInt>*/{
    let r = '0x', sign = 1n, s = BigInt(v).toString(16)
    if(s[0] == '-') s = s.substr(1), sign = -1n
    for(let i = s.length; i > 0; i -= 2)
      r += (i == 1) ? ('0' + s[i-1]) : s[i-2] + s[i-1]
    return sign*BigInt(r)
  }
  static ntohl32(v)/*:<Number>*/{return Number(this.ntohl(v))}
}

function uuid() {
    return Xuid.v4New;
}

export { uuid };
