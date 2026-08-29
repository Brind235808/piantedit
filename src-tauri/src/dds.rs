use std::convert::TryInto;

#[derive(Debug, serde::Serialize)]
pub struct DdsInfo { pub width: u32, pub height: u32, pub mip_levels: u32, pub array_size: u32, pub format: String, pub cube: bool, pub dx10: bool }

fn u32le(b: &[u8], at: usize) -> Result<u32, String> { b.get(at..at+4).and_then(|x| Some(u32::from_le_bytes(x.try_into().ok()?))).ok_or_else(|| "DDS header truncated".to_string()) }

pub fn parse(bytes: &[u8]) -> Result<DdsInfo, String> {
    if bytes.len() < 128 || &bytes[0..4] != b"DDS " { return Err("不是有效的 DDS 文件".into()); }
    let height=u32le(bytes,12)?; let width=u32le(bytes,16)?; let mip_levels=u32le(bytes,28)?.max(1);
    let pf_flags=u32le(bytes,80)?; let fourcc=&bytes[84..88]; let caps2=u32le(bytes,112)?;
    let mut format = if pf_flags & 0x4 != 0 { String::from_utf8_lossy(fourcc).trim_end_matches('\0').to_string() } else { "RGBA".into() };
    let mut array_size=1; let mut dx10=false;
    if fourcc == b"DX10" {
        if bytes.len() < 148 { return Err("DX10 DDS header truncated".into()); }
        let dxgi=u32le(bytes,128)?; array_size=u32le(bytes,140)?.max(1); dx10=true;
        format=match dxgi { 71=>"BC1_UNORM",72=>"BC1_UNORM_SRGB",77=>"BC3_UNORM",78=>"BC3_UNORM_SRGB",80=>"BC4_UNORM",83=>"BC5_UNORM",95=>"BC6H_UF16",98=>"BC7_UNORM",99=>"BC7_UNORM_SRGB",28=>"R8G8B8A8_UNORM",29=>"R8G8B8A8_UNORM_SRGB",_=>"DXGI_UNKNOWN" }.into();
    }
    Ok(DdsInfo { width, height, mip_levels, array_size, format, cube: caps2 & 0x200 != 0, dx10 })
}
